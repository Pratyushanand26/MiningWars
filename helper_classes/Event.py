class Event:
    def __init__(self, time, ev_type, peer_id, payload=None):
        # The simulated time this event occurs
        self.time = time
        # A string like "TX_GEN", "TX_RECV", "BLK_MINED", "BLK_RECV"
        self.type = ev_type
        # The integer ID of the peer handling this event
        self.peer = peer_id
        # Optional data attached (a Transaction or a Block)
        self.data = payload

    # This makes Python compare events by time when pushing into a heap
    def __lt__(self, other):
        return self.time < other.time