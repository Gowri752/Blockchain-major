#!/usr/bin/env python3
"""
Test the complete registration and verification flow
"""
import os
import json
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv
from utils.blockchain import BlockchainInterface

# Load environment variables
load_dotenv()

def test_registration_and_verification():
    print("=== TESTING FULL REGISTRATION & VERIFICATION FLOW ===")
    
    # Get configuration
    node_url = os.getenv('ETHEREUM_NODE_URL', 'http://127.0.0.1:7545')
    contract_address = os.getenv('CONTRACT_ADDRESS')
    private_key = os.getenv('PRIVATE_KEY')
    
    print(f"Using contract: {contract_address}")
    
    # Load contract ABI
    try:
        abi_path = os.path.join(os.path.dirname(__file__), 'contracts', 'compiled', 'ImageVerification.abi')
        with open(abi_path, 'r') as f:
            contract_abi = json.load(f)
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
    
    # Test data
    test_hash = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    test_filename = "test_image.jpg"
    
    print(f"\nTesting with hash: {test_hash}")
    print(f"Testing with filename: {test_filename}")
    
    # Step 1: Check if already registered
    print("\n--- Step 1: Checking if hash already exists ---")
    try:
        is_registered = blockchain.is_image_registered(test_hash)
        print(f"Already registered: {is_registered}")
        
        if is_registered:
            print("Hash already exists, getting details...")
            details = blockchain.get_image_details(test_hash)
            print(f"Existing details: {details}")
            return True
    except Exception as e:
        print(f"ERROR checking registration: {e}")
        return False
    
    # Step 2: Register the image
    print("\n--- Step 2: Registering image on blockchain ---")
    try:
        result = blockchain.register_image(test_hash, test_filename)
        print(f"Registration result: {result}")
        
        if result['status'] != 'success':
            print("ERROR: Registration failed!")
            return False
            
        print(f"SUCCESS: Image registered! TX Hash: {result['transaction_hash']}")
    except Exception as e:
        print(f"ERROR during registration: {e}")
        return False
    
    # Step 3: Verify the registration
    print("\n--- Step 3: Verifying registration ---")
    try:
        # Check if registered
        is_registered = blockchain.is_image_registered(test_hash)
        print(f"Is now registered: {is_registered}")
        
        # Get details
        details = blockchain.get_image_details(test_hash)
        print(f"Image details: {details}")
        
        # Get total images
        total = blockchain.get_total_images()
        print(f"Total images in contract: {total}")
        
        if details.get('exists'):
            print("SUCCESS: Image verification working correctly!")
            return True
        else:
            print("ERROR: Image not found after registration!")
            return False
            
    except Exception as e:
        print(f"ERROR during verification: {e}")
        return False

if __name__ == "__main__":
    success = test_registration_and_verification()
    
    print("\n" + "="*60)
    if success:
        print("SUCCESS: Full flow test completed successfully!")
        print("Registration and verification are working correctly.")
    else:
        print("ERROR: Full flow test failed!")
        print("There's an issue with registration or verification.")
    print("="*60)
