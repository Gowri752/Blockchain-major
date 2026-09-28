#!/usr/bin/env python3
"""
Diagnose the verification issue
"""
import os
import json
import requests
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv
from utils.blockchain import BlockchainInterface

# Load environment variables
load_dotenv()

def diagnose_verification_issue():
    print("=== DIAGNOSING VERIFICATION ISSUE ===")
    
    # Check environment variables
    node_url = os.getenv('ETHEREUM_NODE_URL', 'http://127.0.0.1:7545')
    contract_address = os.getenv('CONTRACT_ADDRESS')
    private_key = os.getenv('PRIVATE_KEY')
    
    print(f"Node URL: {node_url}")
    print(f"Contract Address: {contract_address}")
    print(f"Private Key: {private_key[:10]}...{private_key[-10:] if private_key else 'Not found'}")
    
    if not contract_address:
        print("ERROR: CONTRACT_ADDRESS is empty in .env file!")
        return False
    
    # Test blockchain connection
    web3 = Web3(Web3.HTTPProvider(node_url))
    if not web3.is_connected():
        print("ERROR: Cannot connect to blockchain!")
        return False
    
    print("SUCCESS: Connected to blockchain")
    
    # Get account info
    account = Account.from_key(private_key)
    balance = web3.eth.get_balance(account.address)
    balance_eth = web3.from_wei(balance, 'ether')
    
    print(f"Account Address: {account.address}")
    print(f"Account Balance: {balance_eth} ETH")
    
    # Test contract interaction
    try:
        abi_path = os.path.join(os.path.dirname(__file__), 'contracts', 'compiled', 'ImageVerification.abi')
        with open(abi_path, 'r') as f:
            contract_abi = json.load(f)
        
        blockchain = BlockchainInterface(
            node_url,
            contract_address,
            contract_abi,
            private_key
        )
        
        # Check total images in contract
        total_images = blockchain.get_total_images()
        print(f"Total images in contract: {total_images}")
        
        if total_images > 0:
            # Get user's images
            user_images = blockchain.get_user_images(account.address)
            print(f"Images registered by your account: {len(user_images)}")
            
            if user_images:
                print("Your registered image hashes:")
                for i, img_hash in enumerate(user_images[:3]):  # Show first 3
                    print(f"  {i+1}. {img_hash}")
                    
                # Test verification of first hash
                if user_images:
                    test_hash = user_images[0]
                    print(f"\nTesting verification of hash: {test_hash}")
                    
                    # Direct blockchain verification
                    details = blockchain.get_image_details(test_hash)
                    print(f"Direct blockchain result: {details}")
                    
                    # Flask API verification
                    try:
                        response = requests.post(
                            'http://127.0.0.1:5000/api/verify-hash',
                            json={'image_hash': test_hash},
                            headers={'Content-Type': 'application/json'}
                        )
                        
                        if response.status_code == 200:
                            api_result = response.json()
                            print(f"Flask API result: {api_result}")
                            
                            if api_result.get('verified') != details.get('exists'):
                                print("ERROR: Mismatch between direct blockchain and Flask API!")
                                return False
                            else:
                                print("SUCCESS: Direct blockchain and Flask API match!")
                                return True
                        else:
                            print(f"ERROR: Flask API returned status {response.status_code}")
                            return False
                            
                    except Exception as e:
                        print(f"ERROR: Cannot connect to Flask API: {e}")
                        return False
            else:
                print("No images found for your account")
                return True
        else:
            print("No images registered in contract yet")
            return True
            
    except Exception as e:
        print(f"ERROR: Contract interaction failed: {e}")
        return False

if __name__ == "__main__":
    success = diagnose_verification_issue()
    
    print("\n" + "="*50)
    if success:
        print("DIAGNOSIS: System appears to be working correctly")
    else:
        print("DIAGNOSIS: Found issues that need to be fixed")
    print("="*50)
