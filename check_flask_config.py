#!/usr/bin/env python3
"""
Check Flask configuration
"""
import requests
import json

def check_flask_config():
    print("=== CHECKING FLASK SERVER CONFIGURATION ===")
    
    # Test the health endpoint
    try:
        response = requests.get('http://127.0.0.1:5000/api/health')
        print(f"Health check status: {response.status_code}")
        print(f"Health check response: {response.json()}")
    except Exception as e:
        print(f"ERROR: Cannot connect to Flask server: {e}")
        return False
    
    # Test a sample hash verification via API
    test_hash = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    
    try:
        response = requests.post(
            'http://127.0.0.1:5000/api/verify-hash',
            json={'image_hash': test_hash},
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nAPI verify-hash status: {response.status_code}")
        result = response.json()
        print(f"API verify-hash response: {result}")
        
        if result.get('verified'):
            print("SUCCESS: Flask API can verify the test hash!")
            return True
        else:
            print("INFO: Test hash not found (this is expected if it's the first test)")
            return True
            
    except Exception as e:
        print(f"ERROR: API test failed: {e}")
        return False

if __name__ == "__main__":
    success = check_flask_config()
    
    print("\n" + "="*50)
    if success:
        print("Flask server is responding correctly")
    else:
        print("Flask server has issues")
    print("="*50)
