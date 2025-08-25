import random
import networkx as nx         # for graph creation & analysis

def generate_random_p2p_graph(min_peers=50, max_peers=100, min_deg=3, max_deg=6):
    attempts = 0  
    while True:
        attempts += 1

        # Choose number of peers
        n = random.randint(min_peers, max_peers)

        # Assign target degrees
        target_degrees = {
            node: random.randint(min_deg, max_deg)
            for node in range(n)
        }

        # Create empty graph with n nodes
        G = nx.Graph()
        G.add_nodes_from(range(n))

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