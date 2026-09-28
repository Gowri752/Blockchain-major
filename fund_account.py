#!/usr/bin/env python3
"""
Script to fund an account from Ganache's default accounts
"""
import os
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def fund_account():
    # Connect to Ganache
    web3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))
    
    if not web3.is_connected():
        print("ERROR: Not connected to Ganache!")
        return False
    
    # Get your account address
    private_key = os.getenv('PRIVATE_KEY')
    if not private_key:
        print("ERROR: No private key found in .env file")
        return False
    
    your_account = Account.from_key(private_key)
    your_address = your_account.address
    
    print(f"Your account: {your_address}")
    
    # Get Ganache accounts
    accounts = web3.eth.accounts
    print(f"Found {len(accounts)} Ganache accounts")
    
    # Find a funded account
    for i, account in enumerate(accounts):
        balance = web3.eth.get_balance(account)
        balance_eth = web3.from_wei(balance, 'ether')
        print(f"Account {i}: {account} - {balance_eth} ETH")
        
        if balance_eth > 10:  # If account has more than 10 ETH
            print(f"Using account {i} as funding source")
            
            # Send 5 ETH to your account
            tx = {
                'from': account,
                'to': your_address,
                'value': web3.to_wei(5, 'ether'),
                'gas': 21000,
                'gasPrice': 20000000000
            }
            
            try:
                tx_hash = web3.eth.send_transaction(tx)
                receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
                
                print(f"SUCCESS: Sent 5 ETH to your account!")
                print(f"Transaction hash: {tx_hash.hex()}")
                
                # Check new balance
                new_balance = web3.eth.get_balance(your_address)
                new_balance_eth = web3.from_wei(new_balance, 'ether')
                print(f"Your new balance: {new_balance_eth} ETH")
                
                return True
            except Exception as e:
                print(f"ERROR: Failed to send transaction: {e}")
                return False
    
    print("ERROR: No funded accounts found in Ganache")
    return False

if __name__ == "__main__":
    print("Funding Account...")
    print("=" * 50)
    
    success = fund_account()
    
    print("=" * 50)
    if success:
        print("SUCCESS: Account funded! You can now register images.")
    else:
        print("ERROR: Failed to fund account. Please fund manually in Ganache.")
