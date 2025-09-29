# scripts/test_flow.py
import os
from web3_client import w3, miningwars, miningtoken, send_signed_tx, call_view
from eth_account import Account
from web3 import Web3
load_env_key = os.getenv  # shorthand

# Use OWNER key (deployer) for owner calls
OWNER_PK = os.getenv("OWNER_PRIVKEY")
OWNER_ADDR = Account.from_key(OWNER_PK).address

# Use miner account for miner actions; map from .env (PEER_1)
MINER1_PK = os.getenv("MINER1_PRIVKEY")
MINER1_ADDR = Account.from_key(MINER1_PK).address

def owner_tx(fn_call):
    tx = fn_call.build_transaction({"from": Web3.to_checksum_address(OWNER_ADDR)})
    return send_signed_tx(OWNER_ADDR, OWNER_PK, tx)

def miner_tx(miner_addr, miner_pk, fn_call):
    tx = fn_call.build_transaction({"from": Web3.to_checksum_address(miner_addr)})
    return send_signed_tx(miner_addr, miner_pk, tx)

# 1) set token
print("Setting token address on MiningWars")
receipt = owner_tx(miningwars.functions.setToken(Web3.to_checksum_address(os.getenv("MININGTOKEN_ADDRESS"))))
print("setToken tx status:", receipt.status)

# 2) set per-block reward (owner)
receipt = owner_tx(miningwars.functions.setPerBlockReward(10))
print("setPerBlockReward:", receipt.status)

# 3) start season
receipt = owner_tx(miningwars.functions.startSeason())
print("startSeason:", receipt.status)

# 4) register miner (miner1)
receipt = miner_tx(MINER1_ADDR, MINER1_PK, miningwars.functions.registerMiner())
print("registerMiner miner1:", receipt.status)

# 5) submitBlock with difficulty 100
receipt = miner_tx(MINER1_ADDR, MINER1_PK, miningwars.functions.submitBlock(100))
print("submitBlock miner1:", receipt.status)
print("miner1 score:", call_view(miningwars.functions.getScore(MINER1_ADDR)))

# 6) set season prizes (owner while season active)
receipt = owner_tx(miningwars.functions.setSeasonPrizes(1000, 500, 250))
print("setSeasonPrizes:", receipt.status)

# NOTE: to end season, we must be past seasonEndTime. For dev, you can set a tiny seasonDuration in contract, or
# use anvil to increase block.timestamp, or just call endSeasonAndDistribute after manually setting seasonEndTime via a helper or
# redeploy contract with small seasonDuration. For now, we assume season has ended.

# 7) end season (owner)
# NOTE: to end season, we must be past seasonEndTime. For dev, fast-forward time:
print("⏩ Advancing blockchain time by 2 days...")
w3.provider.make_request("evm_increaseTime", [2 * 24 * 60 * 60])  # +2 days
w3.provider.make_request("evm_mine", [])

# 7) end season (owner)
try:
    receipt = owner_tx(miningwars.functions.endSeasonAndDistribute())
    print("endSeasonAndDistribute:", receipt.status)
except Exception as e:
    print("endSeason call failed:", e)


# 8) check token balance of miner1
balance = call_view(miningtoken.functions.balanceOf(MINER1_ADDR))
print("token balance miner1:", balance)
