# simulator.py
import random
import heapq
from copy import deepcopy
from helper_classes import Block, Event, Peer, Transaction
from helper_functions import extract_network_data, generate_random_p2p_graph, visualize_graph
from dotenv import load_dotenv

# web3 / on-chain helpers
from web3_client import send_signed_tx, miningwars, miningtoken, w3
from web3 import Web3
import os

load_dotenv()

# --- EVENT TYPES ---
EVENT_TX_GEN      = "TX_GEN"      # schedule a new transaction creation
EVENT_TX_RECV     = "TX_RECV"     # a peer receives a transaction
EVENT_BLOCK_MINED = "BLOCK_MINED" # a peer finishes mining a block
EVENT_BLOCK_RECV  = "BLOCK_RECV"  # a peer receives a block

class Simulator:
    def __init__(self, G, fast_frac=0.8, high_cpu_frac=0.7, Ttx=10.0, I=12.0):
        # clock & counters
        self.time = 0.0
        self.tx_counter = 0
        self.block_counter = 0
        self.block_reward = 1
        self.event_queue = []

        # logging for later consumption (FastAPI / debugging)
        self.logs = []

        # simulation params (assign early)
        self.Ttx = Ttx
        self.I = I

        # network topology
        self.adj, self.rho = extract_network_data(G)

        # on-chain toggle and owner creds
        self.onchain = os.getenv("ONCHAIN")
        owner_addr_raw = os.getenv("OWNER_ADDR")
        self.owner_addr = Web3.to_checksum_address(owner_addr_raw) if owner_addr_raw else None
        self.owner_pk = os.getenv("OWNER_PRIVKEY")

        # optional auto-register toggle
        self.auto_register_peers = os.getenv("AUTO_REGISTER_PEERS", "true").lower() == "true"

        if self.onchain:
            if not self.owner_addr or not self.owner_pk:
                raise RuntimeError("OWNER_ADDR and OWNER_PRIVKEY must be set in .env for onchain owner ops")

        # create peers
        self.peers = {}
        for pid in G.nodes():
            is_fast     = (random.random() < fast_frac)
            is_high_cpu = (random.random() < high_cpu_frac)
            peer = Peer(pid, is_fast=is_fast, is_high_cpu=is_high_cpu)
            # ensure peer has required attributes in constructor: balance, hash_power, mempool, etc.
            # e.g., Peer should initialize: balance, hash_power, mempool (dict), block_tree (dict), heights (dict), mined_blocks (list), block_arrival (dict)
            self.peers[pid] = peer

        # peer -> account mapping using .env names MINER{pid}_ADDR / MINER{pid}_PRIVKEY
        self.peer_accounts = {}
        for pid in self.peers:
            addr = os.getenv(f"MINER{pid}_ADDR")
            pk = os.getenv(f"MINER{pid}_PRIVKEY")
            if addr and pk:
                self.peer_accounts[pid] = {"addr": Web3.to_checksum_address(addr), "pk": pk}
                # Register on-chain immediately (optional)
                if self.onchain and self.auto_register_peers:
                    try:
                        fn = miningwars.functions.registerMiner()
                        tx = fn.build_transaction({"from": self.peer_accounts[pid]["addr"]})
                        receipt = send_signed_tx(self.peer_accounts[pid]["addr"], self.peer_accounts[pid]["pk"], tx)
                        msg = f"On-chain registerMiner for peer {pid} succeeded, status: {receipt.status}"
                        print(msg)
                        self.logs.append(msg)
                    except Exception as e:
                        err = f"onchain register failed for peer {pid}: {e}"
                        print(err)
                        self.logs.append(err)

        # authoritative ledger (after peers exist)
        self.ledger = {pid: getattr(self.peers[pid], "balance", 0) for pid in self.peers}

        # genesis block for every peer's local view
        genesis = Block("genesis", None, -1, [])
        for peer in self.peers.values():
            peer.block_tree["genesis"] = genesis
            peer.heights["genesis"] = 0
            peer.current_tip = "genesis"

        # difficulty & retarget params
        total_hash = sum(getattr(p, "hash_power", 0) for p in self.peers.values())
        self.D = self.I * total_hash if total_hash > 0 else 1.0
        self.retarget_interval = 10
        self.min_adjust = 0.5
        self.max_adjust = 2.0
        self.recent_block_timestamps = []

        # season params
        self.season_block_length = int(os.getenv("SEASON_BLOCK_LENGTH", "50"))
        self.season_block_counter = 0
        self.season_scores = {pid: 0 for pid in self.peers}

        # schedule initial events
        for pid, peer in self.peers.items():
            t_tx = random.expovariate(1.0 / self.Ttx) if self.Ttx > 0 else float("inf")
            heapq.heappush(self.event_queue, Event(t_tx, EVENT_TX_GEN, pid))

            rate = self._miner_rate(peer)
            if rate > 0:
                t_blk = random.expovariate(rate)
                heapq.heappush(self.event_queue,
                               Event(t_blk, EVENT_BLOCK_MINED, pid, peer.current_tip))


    def peer_id_to_addr(self, pid):
        """Return (addr, pk) if mapped, else (None, None)."""
        info = self.peer_accounts.get(pid)
        if not info:
            return None, None
        return info["addr"], info["pk"]


    def _miner_rate(self, peer):
        # lambda_i = H_i / D
        if getattr(self, "D", 0) <= 0:
            return peer.hash_power if getattr(peer, "hash_power", 0) > 0 else 0.0
        return peer.hash_power / self.D if getattr(peer, "hash_power", 0) > 0 else 0.0


    def run(self, end_time):
        """
        Process events until no events left or time exceeds end_time.
        """
        while self.event_queue and self.time < end_time:
            ev = heapq.heappop(self.event_queue)
            # advance clock
            self.time = ev.time
            # dispatch
            self.dispatch(ev)


    def write_results(self, filename="results.txt"):
        with open(filename, "w") as f:
            for pid, peer in self.peers.items():
                f.write(f"Peer {pid} arrivals:\n")
                for blk, t in peer.block_arrival.items():
                    f.write(f"  {blk} @ {t:.2f}\n")


    def dispatch(self, ev):
        if ev.type == EVENT_TX_GEN:
            self._handle_tx_gen(ev)
        elif ev.type == EVENT_TX_RECV:
            self._handle_tx_recv(ev)
        elif ev.type == EVENT_BLOCK_MINED:
            self._handle_block_mined(ev)
        elif ev.type == EVENT_BLOCK_RECV:
            self._handle_block_recv(ev)
        else:
            pass


    def _handle_tx_gen(self, ev):
        peer = self.peers[ev.peer]
        # schedule next TX_GEN
        next_t = ev.time + (random.expovariate(1.0 / self.Ttx) if self.Ttx > 0 else float("inf"))
        heapq.heappush(self.event_queue, Event(next_t, EVENT_TX_GEN, peer.id))

        # create transaction if enough balance in ledger (authoritative)
        amount = 1
        if self.ledger.get(peer.id, 0) < amount:
            return

        receiver = random.choice([pid for pid in self.peers if pid != peer.id])
        tx_id = f"tx{self.tx_counter}"
        self.tx_counter += 1

        tx = Transaction(tx_id, peer.id, receiver, amount)

        # deduct from ledger (authoritative) and sync local view
        self.ledger[peer.id] = self.ledger.get(peer.id, 0) - amount
        peer.balance = self.ledger[peer.id]

        # add to origin mempool
        peer.mempool[tx.id] = tx

        # forward to neighbors, include 'from' so neighbors don't echo back
        for nbr in self.adj[peer.id]:
            base = self.rho[(min(peer.id, nbr), max(peer.id, nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                           Event(recv_t, EVENT_TX_RECV, nbr, {"tx": tx, "from": peer.id}))


    def _handle_tx_recv(self, ev):
        peer = self.peers[ev.peer]
        # ev.data may be dict with 'tx' and 'from'
        if isinstance(ev.data, dict):
            tx = ev.data["tx"]
            from_peer = ev.data.get("from")
        else:
            tx = ev.data
            from_peer = None

        # if already have it, ignore
        if tx.id in peer.mempool:
            return

        # add to local mempool
        peer.mempool[tx.id] = tx

        # forward to neighbors (avoid sending back to sender)
        for nbr in self.adj[peer.id]:
            if nbr == from_peer:
                continue
            base = self.rho[(min(peer.id, nbr), max(peer.id, nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                           Event(recv_t, EVENT_TX_RECV, nbr, {"tx": tx, "from": peer.id}))


    def _handle_block_mined(self, ev):
        peer = self.peers[ev.peer]
        # ev.data carries the tip the miner started on (we stored it when scheduling)
        start_tip = ev.data if ev.data is not None else peer.current_tip

        # if the tip changed while the peer was mining, abort this outcome and reschedule
        if start_tip != peer.current_tip:
            rate = self._miner_rate(peer)
            if rate > 0:
                next_t = ev.time + random.expovariate(rate)
                heapq.heappush(self.event_queue,
                               Event(next_t, EVENT_BLOCK_MINED, peer.id, peer.current_tip))
            return

        # Successful mine on start_tip (which equals current_tip)
        blk_id = f"blk{self.block_counter}"
        self.block_counter += 1
        parent = start_tip
        txns = list(peer.mempool.values())

        block = Block(blk_id, parent, peer.id, txns)

        # update miner's local block tree & heights
        peer.block_tree[blk_id] = block
        peer.heights[blk_id] = peer.heights.get(parent, 0) + 1
        peer.current_tip = blk_id
        peer.mined_blocks.append(blk_id)

        # record arrival time for miner (local)
        peer.block_arrival[blk_id] = ev.time

        # --- ECONOMY: update global ledger ONCE (authoritative) ---
        # coinbase to miner
        self.ledger[peer.id] = self.ledger.get(peer.id, 0) + self.block_reward

        # transaction payouts (credit receivers)
        for tx in txns:
            # send amounts to receivers in ledger
            self.ledger[tx.receiver] = self.ledger.get(tx.receiver, 0) + tx.amount

        # sync local balances for miner and receivers (so their local view is up-to-date)
        affected_pids = {peer.id} | {tx.receiver for tx in txns}
        for pid in affected_pids:
            self.peers[pid].balance = self.ledger.get(pid, self.peers[pid].balance)

        # determine a sensible difficulty to report on-chain
        block_difficulty = getattr(peer, "hash_power", 100)
        if txns:
            tx_d = sum(getattr(t, "difficulty", 0) for t in txns)
            if tx_d > 0:
                block_difficulty = tx_d

        # inside _handle_block_mined, after ledger update -> submitBlock on-chain (if mapped)
        if self.onchain and peer.id in self.peer_accounts:
            acct = self.peer_accounts[peer.id]
            try:
                fn = miningwars.functions.submitBlock(int(block_difficulty))
                tx = fn.build_transaction({"from": acct["addr"]})
                receipt = send_signed_tx(acct["addr"], acct["pk"], tx)
                msg = f"submitBlock onchain tx status: {receipt.status} (peer {peer.id})"
                print(msg)
                self.logs.append(msg)
            except Exception as e:
                err = f"submitBlock onchain failed for peer {peer.id}: {e}"
                print(err)
                self.logs.append(err)

        # remove included txs from mempool of all peers (prevents re-inclusion)
        for tx in txns:
            for p in self.peers.values():
                if tx.id in p.mempool:
                    del p.mempool[tx.id]

        # clear miner's mempool (already removed above, but keep consistent)
        peer.mempool.clear()

        # season scoring + bookkeeping
        self.season_scores[peer.id] = self.season_scores.get(peer.id, 0) + 1
        self.season_block_counter += 1

        # track timestamp for retarget
        self.recent_block_timestamps.append(ev.time)

        # broadcast the new block to neighbors (payload is a deepcopy of the block to avoid mutation issues)
        for nbr in self.adj[peer.id]:
            base = self.rho[(min(peer.id, nbr), max(peer.id, nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                           Event(recv_t, EVENT_BLOCK_RECV, nbr, deepcopy(block)))

        # retarget difficulty if needed
        if len(self.recent_block_timestamps) >= self.retarget_interval:
            t0 = self.recent_block_timestamps[-self.retarget_interval]
            t1 = self.recent_block_timestamps[-1]
            # observed average interval between consecutive blocks in the window
            # (note: retarget based on observed_interval / target I)
            observed_interval = (t1 - t0) / max(1, (self.retarget_interval - 1))
            factor = 1.0
            if observed_interval > 0:
                factor = observed_interval / self.I
            factor = max(self.min_adjust, min(self.max_adjust, factor))
            oldD = self.D
            self.D = self.D * factor
            self.recent_block_timestamps = self.recent_block_timestamps[-self.retarget_interval:]
            self.logs.append(f"Retarget: D {oldD:.3f} -> {self.D:.3f} (factor {factor:.3f})")

        # end-of-season check
        if self.season_block_counter >= self.season_block_length:
            self._end_season()

        # schedule next mining attempt (use current tip)
        rate = self._miner_rate(peer)
        if rate > 0:
            next_t = ev.time + random.expovariate(rate)
            heapq.heappush(self.event_queue,
                           Event(next_t, EVENT_BLOCK_MINED, peer.id, peer.current_tip))


    def _handle_block_recv(self, ev):
        peer = self.peers[ev.peer]
        block = ev.data  # expecting a Block object
        if block.id in peer.block_tree:
            return

        # add block to local tree
        peer.block_tree[block.id] = block
        parent = block.parent
        peer.heights[block.id] = peer.heights.get(parent, 0) + 1

        # record arrival time locally
        peer.block_arrival[block.id] = ev.time

        # update this peer's local balances from ledger for affected participants
        # (ledger already updated at mining time)
        for tx in block.txns:
            # update receiver's local view if this peer is the receiver
            if tx.receiver == peer.id:
                peer.balance = self.ledger.get(tx.receiver, peer.balance)
            # remove included txns from this peer's mempool (if present)
            if tx.id in peer.mempool:
                del peer.mempool[tx.id]

        # fork resolution: follow longest chain
        if peer.heights[block.id] > peer.heights.get(peer.current_tip, 0):
            peer.current_tip = block.id
            rate = self._miner_rate(peer)
            if rate > 0:
                next_t = ev.time + random.expovariate(rate)
                heapq.heappush(self.event_queue,
                               Event(next_t, EVENT_BLOCK_MINED, peer.id, peer.current_tip))

        # forward block to neighbours (avoid immediate echo back to miner)
        for nbr in self.adj[peer.id]:
            if nbr == block.miner:
                continue
            base = self.rho[(min(peer.id, nbr), max(peer.id, nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                           Event(recv_t, EVENT_BLOCK_RECV, nbr, deepcopy(block)))


    def _end_season(self):
        # compute top-3 winners by season_scores
        ranked = sorted(self.season_scores.items(), key=lambda kv: kv[1], reverse=True)
        winners = [pid for pid, _ in ranked[:3]]
        rewards = [3, 2, 1]  # example reward amounts for 1st/2nd/3rd

        # log
        msg = f"[SEASON END] block_counter={self.block_counter}, winners={ranked[:3]}"
        print(msg)
        self.logs.append(msg)

        # credit ledger & sync local views
        for pid, amt in zip(winners, rewards):
            self.ledger[pid] = self.ledger.get(pid, 0) + amt
            self.peers[pid].balance = self.ledger[pid]

        # reset season counters
        self.season_scores = {pid: 0 for pid in self.peers}
        self.season_block_counter = 0

        # on-chain: call contract owner to distribute prizes
        if self.onchain:
            try:
                fn = miningwars.functions.endSeasonAndDistribute()
                tx = fn.build_transaction({"from": self.owner_addr})
                receipt = send_signed_tx(self.owner_addr, self.owner_pk, tx)
                msg = f"onchain endSeasonAndDistribute status: {receipt.status}"
                print(msg)
                self.logs.append(msg)
            except Exception as e:
                err = f"onchain endSeason failed: {e}"
                print(err)
                self.logs.append(err)

        # optional: return winners/rewards for external use
        return winners, rewards

    # end of Simulator class
