# web3_client.py
import json
from web3 import Web3
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()  # optional if using .env

RPC = os.getenv("RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("MININGWARS_ADDRESS")  # set this in .env or config.json
ABI_PATH = Path("out/MiningWars.json")  # adjust if your path differs

w3 = Web3(Web3.HTTPProvider(RPC))
assert w3.is_connected(), "Failed to connect to RPC"

with ABI_PATH.open() as f:
    artifact = json.load(f)
abi = artifact.get("abi") or artifact.get("output", {}).get("abi")

contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=abi)
