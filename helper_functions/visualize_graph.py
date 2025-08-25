import networkx as nx         # for graph creation & analysis
import matplotlib.pyplot as plt  # for drawing & saving figures

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