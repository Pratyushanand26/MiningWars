from Simulator import Simulator
from helper_functions import  generate_random_p2p_graph
print("hi")
G = generate_random_p2p_graph()   # your helper
print("2")
sim = Simulator(G, Ttx=10.0, I=60.0)
print("3")
sim.season_block_length = 20   # very small for quick tests
print("started")
sim.run(end_time=100)
print("ended")
