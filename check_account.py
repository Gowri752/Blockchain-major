#!/usr/bin/env python3
"""
Script to check account balance and blockchain connection
"""
import os
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_account():
    # Get configuration from environment
    node_url = os.getenv('ETHEREUM_NODE_URL', 'http://127.0.0.1:7545')
    private_key = os.getenv('PRIVATE_KEY')
    
    print(f"Connecting to: {node_url}")
    print(f"Private Key: {private_key[:10]}...{private_key[-10:] if private_key else 'Not found'}")
    
    # Connect to blockchain
    web3 = Web3(Web3.HTTPProvider(node_url))
    
    # Check connection
    if not web3.is_connected():
        print("ERROR: Not connected to blockchain!")
        return False
    
    print("SUCCESS: Connected to blockchain")
    print(f"Chain ID: {web3.eth.chain_id}")
    print(f"Gas Price: {web3.eth.gas_price}")
    
    if private_key:
        # Get account from private key
        account = Account.from_key(private_key)
        address = account.address
        
        print(f"Account Address: {address}")
        
        # Check balance
        balance_wei = web3.eth.get_balance(address)
        balance_eth = web3.from_wei(balance_wei, 'ether')
        
        print(f"Balance: {balance_eth} ETH")
        
        if balance_eth < 0.1:
            print("WARNING: Low balance! Need at least 0.1 ETH for transactions")
            return False
        else:
            print("SUCCESS: Sufficient balance for transactions")
            return True
    else:
        print("ERROR: No private key found in .env file")
        return False

if __name__ == "__main__":
    print("Checking Account Status...")
    print("=" * 50)
    
    success = check_account()
    
    print("=" * 50)
    if success:
        print("SUCCESS: Account is ready for transactions!")
    else:
        print("ERROR: Account setup needs attention")
