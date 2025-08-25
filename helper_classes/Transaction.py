class Transaction:
    def __init__(self, tx_id, origin_peer, receiver_peer, amount, size_bytes=1024):
        self.id = tx_id
        self.origin = origin_peer
        self.receiver = receiver_peer
        self.amount = amount
        self.size = size_bytes