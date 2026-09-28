#!/usr/bin/env python3
"""
Test Flask API with current configuration
"""
import requests
import json

def test_flask_api():
    print("=== TESTING FLASK API ===")
    
    # Test health endpoint
    try:
        response = requests.get('http://127.0.0.1:5000/api/health')
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"ERROR: Cannot connect to Flask: {e}")
        return False
    
    # Test with the hash from your verification attempt
    test_hash = "08cedc43af1d83a5d73feaecb29b53"  # From your screenshot (truncated)
    
    # Let's use a full 64-character hash for testing
    full_test_hash = "08cedc43af1d83a5d73feaecb29b53" + "0" * (64 - len("08cedc43af1d83a5d73feaecb29b53"))
    
    print(f"\nTesting hash verification with: {full_test_hash}")
    
    try:
        response = requests.post(
            'http://127.0.0.1:5000/api/verify-hash',
            json={'image_hash': full_test_hash},
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"API Response Status: {response.status_code}")
        result = response.json()
        print(f"API Response: {json.dumps(result, indent=2)}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: API test failed: {e}")
        return False

def register_test_image():
    """Register a test image to verify the flow works"""
    print("\n=== REGISTERING TEST IMAGE ===")
    
    test_hash = "1111111111111111111111111111111111111111111111111111111111111111"
    test_filename = "test_image.jpg"
    
    try:
        response = requests.post(
            'http://127.0.0.1:5000/api/register',
            json={
                'image_hash': test_hash,
                'filename': test_filename
            },
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Registration Status: {response.status_code}")
        result = response.json()
        print(f"Registration Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200 and result.get('success'):
            print("SUCCESS: Test image registered!")
            
            # Now verify it
            print("\n=== VERIFYING TEST IMAGE ===")
            verify_response = requests.post(
                'http://127.0.0.1:5000/api/verify-hash',
                json={'image_hash': test_hash},
                headers={'Content-Type': 'application/json'}
            )
            
            verify_result = verify_response.json()
            print(f"Verification Response: {json.dumps(verify_result, indent=2)}")
            
            if verify_result.get('verified'):
                print("SUCCESS: Registration and verification working!")
                return True
            else:
                print("ERROR: Registration worked but verification failed!")
                return False
        else:
            print("ERROR: Registration failed!")
            return False
            
    except Exception as e:
        print(f"ERROR: Registration test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Flask API with new configuration...")
    
    api_test = test_flask_api()
    reg_test = register_test_image()
    
    print("\n" + "="*50)
    if api_test and reg_test:
        print("SUCCESS: Flask API is working correctly!")
        print("You can now register and verify images.")
    else:
        print("ERROR: Flask API has issues.")
    print("="*50)
