#!/usr/bin/env python3
"""
Script to test the new contract deployment
"""
import os
import json
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_contract():
    # Get configuration
    node_url = os.getenv('ETHEREUM_NODE_URL', 'http://127.0.0.1:7545')
    contract_address = os.getenv('CONTRACT_ADDRESS')
    private_key = os.getenv('PRIVATE_KEY')
    
    print(f"Testing contract deployment...")
    print(f"Node URL: {node_url}")
    print(f"Contract Address: {contract_address}")
    print(f"Private Key: {private_key[:10]}...{private_key[-10:] if private_key else 'Not found'}")
    
    # Connect to blockchain
    web3 = Web3(Web3.HTTPProvider(node_url))
    
    if not web3.is_connected():
        print("ERROR: Not connected to blockchain!")
        return False
    
    print("SUCCESS: Connected to blockchain")
    
    # Get account
    account = Account.from_key(private_key)
    print(f"Account Address: {account.address}")
    
    # Check balance
    balance = web3.eth.get_balance(account.address)
    balance_eth = web3.from_wei(balance, 'ether')
    print(f"Account Balance: {balance_eth} ETH")
    
    # Load contract ABI
    try:
        abi_path = os.path.join(os.path.dirname(__file__), 'contracts', 'compiled', 'ImageVerification.abi')
        with open(abi_path, 'r') as f:
            contract_abi = json.load(f)
        print("SUCCESS: Contract ABI loaded")
    except Exception as e:
        print(f"ERROR: Failed to load contract ABI: {e}")
        return False
    
    # Create contract instance
    try:
        contract = web3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=contract_abi
        )
        print("SUCCESS: Contract instance created")
    except Exception as e:
        print(f"ERROR: Failed to create contract instance: {e}")
        return False
    
    # Test contract functions
    try:
        # Test getTotalImages function
        total_images = contract.functions.getTotalImages().call()
        print(f"Total images in contract: {total_images}")
        
        print("SUCCESS: Contract is working correctly!")
        return True
    except Exception as e:
        print(f"ERROR: Failed to call contract function: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING NEW CONTRACT DEPLOYMENT")
    print("=" * 60)
    
    success = test_contract()
    
    print("=" * 60)
    if success:
        print("SUCCESS: New contract is ready for use!")
        print("You can now register images on the blockchain.")
    else:
        print("ERROR: Contract setup needs attention.")
        print("Please check the configuration and try again.")
    print("=" * 60)
