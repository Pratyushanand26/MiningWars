from helper_functions import extract_network_data,generate_random_p2p_graph,visualize_graph
import networkx as nx         # for graph creation & analysis

def main():
    G = generate_random_p2p_graph()
    all_degs = [deg for (_, deg) in G.degree()]
    print("  • Min degree:", min(all_degs))
    print("  • Max degree:", max(all_degs))
    print("  • #Connected components:", nx.number_connected_components(G))
    visualize_graph(G, output_image="network.png")

    adj, rho = extract_network_data(G)
    print("Sample adjacency:", list(adj.items())[:3])
    print("Sample delays:", list(rho.items())[:3])

if __name__ == "__main__":
    main()
