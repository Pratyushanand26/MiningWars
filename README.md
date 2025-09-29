⛏️ MiningWars DApp Simulation: A PoW Network and Web3 Bridge
This project implements an event-driven simulator in Python for a Proof-of-Work (PoW) cryptocurrency network and bridges its simulated activity directly to a deployed Ethereum Smart Contract. This creates a realistic, closed-loop testing environment for a decentralized application (DApp).

🚀 Key Features and Technical Achievements
This project demonstrates proficiency in distributed systems simulation, smart contract development, and Web3 integration.

Event-Driven PoW Simulation: Implements a discrete-event simulator in Python that models core blockchain dynamics:

Mining Dynamics: Peers mine blocks using exponential distribution based on individual hash power, factoring in network difficulty D.

Network Topology: Simulates transaction and block propagation delays (ρ) across peers, accounting for "fast" vs. "slow" nodes.

Difficulty Retargeting: Features a dynamic difficulty parameter (D) that adjusts based on observed block time versus a target interval (I).

Fork Resolution: Peers follow the longest-chain rule on block receipt.

Authoritative Ledger: Maintains a reliable off-chain ledger that is updated only when a block is successfully mined (or a valid transaction is initiated).

Solidity Smart Contract Integration: The simulation is the single driver of state change for the deployed contracts:

On-Chain Mirroring: Python submits blocks and initiates season changes as signed transactions via Web3.py.

Tokenomics: Implements two linked contracts (MiningWars.sol and MiningToken.sol) for per-block rewards and end-of-season prize distribution.

Leaderboard Logic: The contract tracks the top three miners (first, second, third) based on season-specific difficulty scores.

Full-Stack Simulation Environment: Creates a ready-to-use testing environment:

Foundry/Anvil: Uses Foundry's local blockchain for rapid, gas-free EVM execution.

Web3.py Bridge: Handles transaction building, signing (using pre-funded Anvil accounts), and broadcasting, ensuring Python's simulated logic is finalized on the blockchain.

⚙️ Technology Stack
Category	Technology	Purpose
Simulation	Python	Discrete Event Simulation engine and game logic.
Blockchain Client	Web3.py	API for building, signing, and sending transactions to the EVM.
Smart Contracts	Solidity (Foundry)	DApp logic, reward mechanism, and state management.
Local Environment	Foundry (Anvil)	Local Ethereum node for quick, free testing.
Configuration	python-dotenv	Secure local storage of private keys and addresses.

Export to Sheets
🛠️ Setup and Installation
1. Requirements

Foundry: Install Foundry (—Tool used for deployment and testing).

Python: Python 3.9+ and a virtual environment (venv).

Dependencies:

Bash

pip install web3 python-dotenv
2. Deployment (Local Anvil Chain)
Start the local blockchain in your project root:

Bash

anvil
Use the forge create --broadcast commands along with an Anvil private key to deploy the contracts (ensure MiningWars is deployed first, and its address is passed to MiningToken's constructor). Capture these addresses and keys for the next step.

3. Configuration
Create a file named .env in the project root and populate it with the addresses and private keys obtained from the Anvil output and deployment:

Code snippet

# Anvil RPC
RPC_URL=http://127.0.0.1:8545
ONCHAIN=true

# Deployed Contract Addresses
MININGWARS_ADDRESS=0x...
MININGTOKEN_ADDRESS=0x...

# Owner (Deployer) Account
OWNER_ADDR=0x...
OWNER_PRIVKEY=0x...

# Miner Mapping (Anvil Accounts for Simulation Peers)
MINER0_ADDR=0x...
MINER0_PRIVKEY=0x...
MINER1_ADDR=0x...
MINER1_PRIVKEY=0x...
🧪 Running the Simulation and Testing
1. Test the CLI Flow
Run the integrated testing script to verify all contract functions are reachable and state changes successfully:

Bash

python scripts/test_flow.py
This script will sequentially: set initial configuration, register miners, submit blocks, fast-forward time, and call endSeasonAndDistribute(), logging the transaction status for each step.

2. Run the Full Event Simulator
The core simulation engine (simulator.py) models the entire network. Run it with custom parameters (ensure you have generated the network graph G using your helper functions):

Python

from helper_functions import generate_random_p2p_graph
from simulator import Simulator

# 1. Initialize Network
G = generate_random_p2p_graph(n=4)

# 2. Run Simulator (Season length is 50 blocks by default)
sim = Simulator(G, Ttx=2.0, I=12.0)
sim.run(end_time=1000)

# 3. Check Final Balances (Read-only)
for pid, peer in sim.peers.items():
    if pid in sim.peer_accounts:
        addr = sim.peer_accounts[pid]["addr"]
        balance = miningtoken.functions.balanceOf(addr).call()
        print(f"Peer {pid} Token Balance: {balance}")