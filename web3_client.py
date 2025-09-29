# web3_client.py
import os, json
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3
from eth_account import Account

load_dotenv()   # loads .env in project root

RPC = os.getenv("RPC_URL", "http://127.0.0.1:8545")
MW_ADDR = os.getenv("MININGWARS_ADDRESS")
MT_ADDR = os.getenv("MININGTOKEN_ADDRESS")

w3 = Web3(Web3.HTTPProvider(RPC))
assert w3.is_connected(), "Cannot connect to RPC"

# load ABIs produced by forge build / forge inspect
MW_ABI_PATH = Path("abi/MiningWars.json")
MT_ABI_PATH = Path("abi/MiningToken.json")

MW_ARTIFACT = json.loads(MW_ABI_PATH.read_text())
MT_ARTIFACT = json.loads(MT_ABI_PATH.read_text())

MW_ABI = MW_ARTIFACT["abi"]
MT_ABI = MT_ARTIFACT["abi"]

miningwars = w3.eth.contract(address=Web3.to_checksum_address(MW_ADDR), abi=MW_ABI)
miningtoken = w3.eth.contract(address=Web3.to_checksum_address(MT_ADDR), abi=MT_ABI)

def send_signed_tx(sender_addr: str, sender_pk: str, tx_dict: dict, wait_receipt=True):
    """
    Signs and sends a transaction dict (built via contract_fn.build_transaction()).
    Returns receipt if wait_receipt is True, else tx_hash.
    """
    sender = Web3.to_checksum_address(sender_addr)
    # ensure nonce
    tx_dict.setdefault("nonce", w3.eth.get_transaction_count(sender))
    # estimate or default gas
    if "gas" not in tx_dict:
        try:
            tx_dict["gas"] = w3.eth.estimate_gas(tx_dict)
        except Exception:
            tx_dict["gas"] = 300000
    # set gasPrice when not using EIP-1559 fields
    if "maxFeePerGas" not in tx_dict and "gasPrice" not in tx_dict:
        tx_dict["gasPrice"] = w3.to_wei("1", "gwei")

    signed = w3.eth.account.sign_transaction(tx_dict, private_key=sender_pk)
    # signed.raw_transaction (web3.py v6) -> use this for sending
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    if wait_receipt:
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return receipt
    return tx_hash

def call_view(fn_call):
    """Call a read-only function: pass contract.functions.foo(...)"""
    return fn_call.call()

print("done")