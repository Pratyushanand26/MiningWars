class Block:
    def __init__(self, blk_id, parent_id, miner_id, transactions):
        # Unique ID for this block
        self.id = blk_id
        # The block it builds on (its parent)
        self.parent = parent_id
        # Who mined it
        self.miner = miner_id
        # A list of Transaction objects it includes
        self.txns = list(transactions)
        # Optional: size could be proportional to number of txns
        self.size = max(512, len(transactions) * 256)