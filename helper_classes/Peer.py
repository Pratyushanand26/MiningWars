import Block

class Peer:
    def __init__(self, peer_id, is_fast=True, is_high_cpu=True, initial_balance=100):
        self.id = peer_id
        self.is_fast = is_fast
        self.is_high_cpu = is_high_cpu
        self.hash_power = 2.0 if is_high_cpu else 1.0
        # inside Peer.__init__, add:
        self.block_arrival = {"genesis": 0.0}   # record arrival times (seconds); genesis at time 0

        # NEW: track coin balance
        self.balance = initial_balance

        # mempool now holds full Transaction objects
        self.mempool = {}

        # block tree and heights
        self.block_tree = {"genesis": Block.Block("genesis", None, None, [])}
        self.heights = {"genesis": 0}
        self.current_tip = "genesis"

        # record blocks this peer mined
        self.mined_blocks = []