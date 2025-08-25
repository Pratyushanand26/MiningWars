import random

def extract_network_data(G):
    # Create adjacency list: {peer: [neighbors]}
    adj = {node: list(G.neighbors(node)) for node in G.nodes()}
    
    # Assign random delays (in seconds) for each undirected edge
    rho = {}
    for u in G.nodes():
        for v in G.neighbors(u):
            if u < v:  # avoid duplicate edge in undirected graph
                delay = round(random.uniform(0.01, 0.5), 3)  # delay in seconds
                rho[(u, v)] = delay

    return adj, rho