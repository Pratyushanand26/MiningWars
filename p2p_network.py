import random
import networkx as nx         # for graph creation & analysis
import matplotlib.pyplot as plt  # for drawing & saving figures

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

def visualize_graph(G, output_image="network.png"):
    plt.figure(figsize=(10, 10))
    pos = nx.spring_layout(G, seed=42)
    nx.draw_networkx_nodes(G, pos, node_size=100, node_color="skyblue", edgecolors="black")
    nx.draw_networkx_edges(G, pos, width=1)
    plt.axis("off")
    num_nodes = G.number_of_nodes()
    avg_deg = sum(dict(G.degree()).values()) / num_nodes
    plt.title(f"Random P2P Network (n={num_nodes}, avg_deg={avg_deg:.2f})")
    plt.tight_layout()
    plt.savefig(output_image, dpi=300)
    print(f"🖼  Graph visualization saved as '{output_image}'")

def main():
    G = generate_random_p2p_graph()
    all_degs = [deg for (_, deg) in G.degree()]
    print("  • Min degree:", min(all_degs))
    print("  • Max degree:", max(all_degs))
    print("  • #Connected components:", nx.number_connected_components(G))
    visualize_graph(G, output_image="network.png")

if __name__ == "__main__":
    main()
