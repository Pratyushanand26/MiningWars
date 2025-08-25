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

        # 5) Simulation parameters
        self.Ttx = Ttx  # mean TX interarrival
        self.I   = I    # mean block interval

        # 6) Schedule each peer's first TX_GEN and BLOCK_MINED
        for pid, peer in self.peers.items():
            # When will this peer generate its first transaction?
            t_tx = random.expovariate(1.0 / self.Ttx)
            ev_tx = Event(t_tx, EVENT_TX_GEN, pid)
            heapq.heappush(self.event_queue, ev_tx)

            # When will this peer mine its first block?
            # Rate = peer.hash_power / I  => mean = I / hash_power
            rate = peer.hash_power / self.I
            t_blk = random.expovariate(rate)
            ev_blk = Event(t_blk, EVENT_BLOCK_MINED, pid)
            heapq.heappush(self.event_queue, ev_blk)

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

    # Placeholder handlers to be implemented next:
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

        # forward to neighbors
        for nbr in self.adj[peer.id]:
            base = self.rho[(min(peer.id,nbr), max(peer.id,nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                          Event(recv_t, EVENT_TX_RECV, nbr, tx))

    def _handle_tx_recv(self, ev):
        peer = self.peers[ev.peer]
        tx = ev.data
        if tx.id in peer.mempool:
            return
        peer.mempool[tx.id] = tx
        for nbr in self.adj[peer.id]:
            if nbr == tx.origin:
                continue
            base = self.rho[(min(peer.id,nbr), max(peer.id,nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                          Event(recv_t, EVENT_TX_RECV, nbr, tx))

    def _handle_block_mined(self, ev):
        peer = self.peers[ev.peer]
        blk_id = f"blk{self.block_counter}"
        self.block_counter += 1
        parent = peer.current_tip
        txns = list(peer.mempool.values())
        block = Block(blk_id, parent, peer.id, txns)

        # update miner state
        peer.block_tree[blk_id] = block
        height = peer.heights[parent] + 1
        peer.heights[blk_id] = height
        peer.current_tip = blk_id
        peer.mined_blocks.append(blk_id)

        # coinbase and TX payouts
        peer.balance += 1
        for tx in txns:
            self.peers[tx.receiver].balance += tx.amount

        peer.mempool.clear()

        # broadcast block
        for nbr in self.adj[peer.id]:
            base = self.rho[(min(peer.id,nbr), max(peer.id,nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                          Event(recv_t, EVENT_BLOCK_RECV, nbr, block))

        # schedule next mining
        rate = peer.hash_power / self.I
        next_t = ev.time + random.expovariate(rate)
        heapq.heappush(self.event_queue,
                      Event(next_t, EVENT_BLOCK_MINED, peer.id))

    def _handle_block_recv(self, ev):
        peer = self.peers[ev.peer]
        block = ev.data
        if block.id in peer.block_tree:
            return
        peer.block_tree[block.id] = block
        parent = block.parent
        peer.heights[block.id] = peer.heights.get(parent, 0) + 1

        # fork resolution: longest-chain
        if peer.heights[block.id] > peer.heights[peer.current_tip]:
            peer.current_tip = block.id
            # restart mining on new tip
            rate = peer.hash_power / self.I
            next_t = ev.time + random.expovariate(rate)
            heapq.heappush(self.event_queue,
                          Event(next_t, EVENT_BLOCK_MINED, peer.id))

        # forward block
        for nbr in self.adj[peer.id]:
            if nbr == block.miner:
                continue
            base = self.rho[(min(peer.id,nbr), max(peer.id,nbr))]
            if not peer.is_fast:
                base *= 1.5
            recv_t = ev.time + base
            heapq.heappush(self.event_queue,
                          Event(recv_t, EVENT_BLOCK_RECV, nbr, block))