# Blockchain Arena P2P Assignment

**Name:** Pratyush Anand
**Roll No:** 24B0344

---

## Overview

This repository contains a Python implementation to generate and visualize a random Peer‐to‐Peer (P2P) network graph. The script builds an undirected graph with:
- A random number of peers (nodes) between 50 and 100.
- Each peer having a degree (number of neighbors) between 3 and 6.
- The entire graph guaranteed to be connected (no isolated clusters).

Once a valid graph is constructed, it is rendered to `network.png`.

---

## Dependencies

- [networkx](https://networkx.org/)  
- [matplotlib](https://matplotlib.org/)  

These can be installed via:

```bash
pip install -r requirements.txt

