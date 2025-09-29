# scripts/test_read.py
from web3_client import w3, miningwars, miningtoken, call_view
print("chain id:", w3.eth.chain_id)
print("latest block:", w3.eth.block_number)
# read owner (exists in your contract)
owner = call_view(miningwars.functions.owner())
print("MiningWars owner:", owner)
print("Token minter (if function exists):")
try:
    print(call_view(miningtoken.functions.minter()))
except Exception:
    print("minter() not present")
