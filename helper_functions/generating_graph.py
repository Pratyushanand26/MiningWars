import random
import networkx as nx    

def generate_random_p2p_graph(min_peers=4, max_peers=5, min_deg=1, max_deg=2):
    print("started G")
    attempts = 0  
    while True:
        attempts += 1

        # Choose number of peers
        n = random.randint(min_peers, max_peers)
        print(n)

        # Assign target degrees
        target_degrees = {
            node: random.randint(min_deg, max_deg)
            for node in range(n)
        }
        print("started G")

        # Create empty graph with n nodes
        G = nx.Graph()
        print("started G")
        G.add_nodes_from(range(n))
        print("started G")

        # Add edges until targets reached or no valid pair remains
        while True:
            pool = [
                node
                for node, tgt in target_degrees.items()
                if G.degree(node) < tgt
            ]
            if len(pool) < 2:
                break

            u, v = random.sample(pool, 2)

            if G.has_edge(u, v):
                continue

            if G.degree(u) < target_degrees[u] and G.degree(v) < target_degrees[v]:
                G.add_edge(u, v)
            else:
                break

        print("started G")    

        # Validate degree constraints and connectivity
        degrees_ok = all(
            min_deg <= G.degree(node) <= max_deg
            for node in G.nodes()
        )
        conn_ok = False
        if degrees_ok:
            try:
                conn_ok = nx.is_connected(G)
            except nx.NetworkXError:
                conn_ok = False

        if degrees_ok and conn_ok:
            print(f"✅ Valid graph found after {attempts} attempt(s). n={n}")
            return G