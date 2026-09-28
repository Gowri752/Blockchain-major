#!/usr/bin/env python3
"""
Debug script to test verification process
"""
import os
import json
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv
from utils.blockchain import BlockchainInterface

# Load environment variables
load_dotenv()

def debug_verification():
    print("=== DEBUGGING VERIFICATION PROCESS ===")
    
    # Get configuration
    node_url = os.getenv('ETHEREUM_NODE_URL', 'http://127.0.0.1:7545')
    contract_address = os.getenv('CONTRACT_ADDRESS')
    private_key = os.getenv('PRIVATE_KEY')
    
    print(f"Node URL: {node_url}")
    print(f"Contract Address: {contract_address}")
    print(f"Private Key: {private_key[:10]}...{private_key[-10:] if private_key else 'Not found'}")
    print()
    
    # Connect to blockchain
    web3 = Web3(Web3.HTTPProvider(node_url))
    
    if not web3.is_connected():
        print("ERROR: Not connected to blockchain!")
        return False
    
    print("SUCCESS: Connected to blockchain")
    
    # Load contract ABI
    try:
        abi_path = os.path.join(os.path.dirname(__file__), 'contracts', 'compiled', 'ImageVerification.abi')
        with open(abi_path, 'r') as f:
            contract_abi = json.load(f)
        print("SUCCESS: Contract ABI loaded")
    except Exception as e:
        print(f"ERROR: Failed to load contract ABI: {e}")
        return False
    
    # Create blockchain interface
    try:
        blockchain = BlockchainInterface(
            node_url,
            contract_address,
            contract_abi,
            private_key
        )
        print("SUCCESS: Blockchain interface created")
    except Exception as e:
        print(f"ERROR: Failed to create blockchain interface: {e}")
        return False
    
    # Test contract functions
    try:
        # Get total images
        total_images = blockchain.get_total_images()
        print(f"Total images in contract: {total_images}")
        
        if total_images > 0:
            print("\n=== CHECKING REGISTERED IMAGES ===")
            
            # Get account address
            account = Account.from_key(private_key)
            user_images = blockchain.get_user_images(account.address)
            print(f"Images registered by your account ({account.address}): {len(user_images)}")
            
            if user_images:
                print("Your registered image hashes:")
                for i, img_hash in enumerate(user_images):
                    print(f"  {i+1}. {img_hash}")
                    
                    # Get details of first image
                    if i == 0:
                        details = blockchain.get_image_details(img_hash)
                        print(f"     Details: {details}")
            else:
                print("No images found for your account")
                
                # Let's check if there are any images at all
                print("\n=== CHECKING ALL REGISTERED IMAGES ===")
                # We'll need to check some sample hashes or get events
                
        else:
            print("No images registered in the contract yet")
            
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to query contract: {e}")
        return False

def test_sample_hash():
    """Test verification with a sample hash"""
    print("\n=== TESTING SAMPLE HASH VERIFICATION ===")
    
    # Use a sample hash (you can replace this with an actual hash from your registration)
    sample_hash = "a" * 64  # 64-character hex string
    
    try:
        # Get configuration
        node_url = os.getenv('ETHEREUM_NODE_URL', 'http://127.0.0.1:7545')
        contract_address = os.getenv('CONTRACT_ADDRESS')
        private_key = os.getenv('PRIVATE_KEY')
        
        # Load contract ABI
        abi_path = os.path.join(os.path.dirname(__file__), 'contracts', 'compiled', 'ImageVerification.abi')
        with open(abi_path, 'r') as f:
            contract_abi = json.load(f)
        
        blockchain = BlockchainInterface(
            node_url,
            contract_address,
            contract_abi,
            private_key
        )
        
        # Test verification
        result = blockchain.get_image_details(sample_hash)
        print(f"Sample hash verification result: {result}")
        
        return True
        
    except Exception as e:
        print(f"ERROR in sample hash test: {e}")
        return False

if __name__ == "__main__":
    success1 = debug_verification()
    success2 = test_sample_hash()
    
    print("\n" + "="*50)
    if success1 and success2:
        print("DEBUG: All tests completed successfully")
    else:
        print("DEBUG: Some tests failed - check configuration")
    print("="*50)
