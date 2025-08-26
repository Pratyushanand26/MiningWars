import random
import heapq
from helper_classes import Block,Event,Peer,Transaction
from helper_functions import extract_network_data,generate_random_p2p_graph,visualize_graph

# --- EVENT TYPES ---
EVENT_TX_GEN      = "TX_GEN"      # schedule a new transaction creation
EVENT_TX_RECV     = "TX_RECV"     # a peer receives a transaction
EVENT_BLOCK_MINED = "BLOCK_MINED" # a peer finishes mining a block
EVENT_BLOCK_RECV  = "BLOCK_RECV"  # a peer receives a block

class Simulator:
    def __init__(self, G, fast_frac=0.8, high_cpu_frac=0.7,
                 Ttx=10.0, I=12.0):
        """
        G: networkx Graph from Assignment 1
        fast_frac: fraction of peers that are 'fast'
        high_cpu_frac: fraction that are 'high-CPU'
        Ttx: average time between user transactions
        I: average network-wide block interval
        """
        # 1) Simulator clock
        self.time = 0.0

        # at the top of __init__ (after self.time or after self.Ttx / self.I)
        self.tx_counter = 0
        self.block_counter = 0


        # 2) Event queue (min-heap by event.time)
        self.event_queue = []

        # 3) Extract network topology & delays
        self.adj, self.rho = extract_network_data(G)

        # 4) Create Peer objects
        self.peers = {}
        n = G.number_of_nodes()
        for pid in G.nodes():
            is_fast     = (random.random() < fast_frac)
            is_high_cpu = (random.random() < high_cpu_frac)
            peer = Peer(pid, is_fast=is_fast, is_high_cpu=is_high_cpu)
            self.peers[pid] = peer

        genesis = Block("genesis", None, -1, [])
        for peer in self.peers.values():
            peer.block_tree["genesis"] = genesis
            peer.heights["genesis"] = 0
            peer.current_tip = "genesis"    

        # 5) Simulation parameters
        self.Ttx = Ttx  # mean TX interarrival
        self.I   = I    # mean block interval

        # 6) Schedule each peer's first TX_GEN and BLOCK_MINED
        for pid, peer in self.peers.items():
            # schedule first mining (inside the for pid, peer in self.peers.items() loop)
            t_tx = random.expovariate(1.0 / self.Ttx)
            heapq.heappush(self.event_queue,Event(t_tx, EVENT_TX_GEN, pid))

            rate = peer.hash_power / self.I
            t_blk = random.expovariate(rate)
            # attach the tip so the handler can detect if the tip changed since scheduling
            heapq.heappush(self.event_queue,
                        Event(t_blk, EVENT_BLOCK_MINED, pid, peer.current_tip))

    def run(self, end_time):
        """
        Process events until no events left or time exceeds end_time.
        """
        while self.event_queue and self.time < end_time:
            # 1) Pop the next event (earliest time)
            ev = heapq.heappop(self.event_queue)
            # 2) Advance the simulator clock
            self.time = ev.time
            # 3) Dispatch to the appropriate handler
            self.dispatch(ev)
    def write_results(self, filename="results.txt"):
        with open(filename, "w") as f:
            for pid, peer in self.peers.items():
                f.write(f"Peer {pid} arrivals:\n")
                for blk, t in peer.block_arrival.items():
                    f.write(f"  {blk} @ {t:.2f}\n")


    def dispatch(self, ev):
        """
        Calls the correct handler based on event type.
        """
        if ev.type == EVENT_TX_GEN:
            self._handle_tx_gen(ev)
        elif ev.type == EVENT_TX_RECV:
            self._handle_tx_recv(ev)
        elif ev.type == EVENT_BLOCK_MINED:
            self._handle_block_mined(ev)
        elif ev.type == EVENT_BLOCK_RECV:
            self._handle_block_recv(ev)
        else:
            # Unknown event type—ignore or raise error
            pass

    def _handle_tx_gen(self, ev):
        peer = self.peers[ev.peer]
        # schedule next TX_GEN
        next_t = ev.time + random.expovariate(1.0 / self.Ttx)
        heapq.heappush(self.event_queue, Event(next_t, EVENT_TX_GEN, peer.id))

        # create transaction if enough balance
        amount = 1
        if peer.balance < amount:
            return

        receiver = random.choice([pid for pid in self.peers if pid != peer.id])
        tx_id = f"tx{self.tx_counter}"
        self.tx_counter += 1

        tx = Transaction(tx_id, peer.id, receiver, amount)
        peer.balance -= amount
        peer.mempool[tx.id] = tx

        # forward to neighbors, include 'from' so neighbors don't send back
        for nbr in self.adj[peer.id]:
            base = self.rho[(min(peer.id, nbr), max(peer.id, nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                        Event(recv_t, EVENT_TX_RECV, nbr, {"tx": tx, "from": peer.id}))


    def _handle_tx_recv(self, ev):
        peer = self.peers[ev.peer]
        # ev.data now may be a dict with 'tx' and 'from'
        if isinstance(ev.data, dict):
            tx = ev.data["tx"]
            from_peer = ev.data.get("from")
        else:
            tx = ev.data
            from_peer = None

        if tx.id in peer.mempool:
            return

        peer.mempool[tx.id] = tx

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
            rate = peer.hash_power / self.I
            next_t = ev.time + random.expovariate(rate)
            # schedule a fresh mining attempt on the current tip
            heapq.heappush(self.event_queue,
                        Event(next_t, EVENT_BLOCK_MINED, peer.id, peer.current_tip))
            return

        # Successful mine on start_tip (which equals current_tip)
        blk_id = f"blk{self.block_counter}"
        self.block_counter += 1
        parent = start_tip
        txns = list(peer.mempool.values())

        block = Block(blk_id, parent, peer.id, txns)

        # update miner state
        peer.block_tree[blk_id] = block
        peer.heights[blk_id] = peer.heights.get(parent, 0) + 1
        peer.current_tip = blk_id
        peer.mined_blocks.append(blk_id)

        # record arrival time for miner (local)
        peer.block_arrival[blk_id] = ev.time

        # coinbase + transaction payouts (credit receiver balances)
        peer.balance += 1
        for tx in txns:
            self.peers[tx.receiver].balance += tx.amount

        # clear mempool locally (these txns were included)
        peer.mempool.clear()

        # broadcast to neighbours (include block as payload)
        for nbr in self.adj[peer.id]:
            base = self.rho[(min(peer.id, nbr), max(peer.id, nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                        Event(recv_t, EVENT_BLOCK_RECV, nbr, block))

        # schedule next mining attempt (attach current tip)
        rate = peer.hash_power / self.I
        next_t = ev.time + random.expovariate(rate)
        heapq.heappush(self.event_queue,
                    Event(next_t, EVENT_BLOCK_MINED, peer.id, peer.current_tip))


    def _handle_block_recv(self, ev):
        peer = self.peers[ev.peer]

        # ev.data may be a Block (we send plain Block objects); handle gracefully
        block = ev.data
        if block.id in peer.block_tree:
            return

        # add block to local tree
        peer.block_tree[block.id] = block
        parent = block.parent
        peer.heights[block.id] = peer.heights.get(parent, 0) + 1

        # record arrival time
        peer.block_arrival[block.id] = ev.time

        # apply coinbase + tx payouts locally (credit miner + receivers)
        # (miner already did this locally when they mined; other peers must do it on receipt)
        self.peers[block.miner].balance += 1
        for tx in block.txns:
            self.peers[tx.receiver].balance += tx.amount
            # remove included txns from this peer's mempool (if present)
            if tx.id in peer.mempool:
                del peer.mempool[tx.id]

        # fork resolution: follow longest chain
        if peer.heights[block.id] > peer.heights.get(peer.current_tip, 0):
            peer.current_tip = block.id
            # restart/schedule mining on the new tip (attach new tip)
            rate = peer.hash_power / self.I
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
                        Event(recv_t, EVENT_BLOCK_RECV, nbr, block))
