# Blockchain-major
 blockchain storage.



🌟 Features
For Image Owners
✅ Upload images and generate cryptographic proof of ownership
✅ Immutable blockchain record with timestamp
✅ AES-256 encryption for secure storage
✅ Certificate of authenticity generation
✅ Transaction history tracking
For Verifiers
✅ Upload images to check authenticity
✅ Compare against blockchain records
✅ Detect image tampering
✅ View original owner and registration details
✅ Verify by hash without uploading files
Core Technologies
Backend: Python 3.8+, Flask, Web3.py
Frontend: HTML5, CSS3, Vanilla JavaScript
Blockchain: Solidity 0.8.19, Ethereum
Security: SHA-256 hashing, AES-256 encryption
Smart Contracts: Truffle/Hardhat deployment
📁 Project Structure
blockchain-image-verification/
├── backend/
│   ├── app.py                      # Main Flask application
│   ├── config.py                   # Configuration settings
│   ├── requirements.txt            # Python dependencies
│   ├── contracts/
│   │   ├── ImageVerification.sol   # Smart contract
│   │   └── compiled/               # Compiled contracts
│   ├── utils/
│   │   ├── blockchain.py           # Blockchain interaction
│   │   ├── encryption.py           # AES encryption
│   │   ├── hashing.py              # SHA-256 hashing
│   │   └── image_handler.py        # Image processing
│   └── routes/
│       ├── upload.py               # Upload endpoints
│       ├── verify.py               # Verification endpoints
│       └── history.py              # History endpoints
├── frontend/
│   ├── index.html                  # Landing page
│   ├── upload.html                 # Upload interface
│   ├── verify.html                 # Verification interface
│   ├── history.html                # Transaction history
│   ├── css/                        # Stylesheets
│   └── js/                         # JavaScript files
├── blockchain/
│   ├── truffle-config.js           # Truffle configuration
│   ├── hardhat.config.js           # Hardhat configuration
│   ├── scripts/deploy.js           # Deployment script
│   ├── migrations/                 # Migration files
│   └── test/                       # Smart contract tests
└── .env                            # Environment variables
🚀 Quick Start
Prerequisites
Python 3.8+
Node.js 16+
Ganache (for local blockchain)
MetaMask browser extension
Git
Installation
Clone the repository
git clone https://github.com/yourusername/blockchain-image-verification.git
cd blockchain-image-verification
Install Python dependencies
cd backend
pip install -r requirements.txt
Install Node.js dependencies
cd ../blockchain
npm install
Set up environment variables
cp .env.example .env
# Edit .env with your configuration
Configuration
Edit the .env file:

# Blockchain Configuration
ETHEREUM_NODE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS_HERE
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
NETWORK_ID=5777

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-this-in-production
Deploy Smart Contract
Using Hardhat (Recommended)
Start local blockchain (Ganache)
ganache-cli
# Or use Ganache GUI
Compile contracts
cd blockchain
npx hardhat compile
Deploy to local network
npx hardhat run scripts/deploy.js --network ganache
Copy contract address from output and update .env
Using Truffle
cd blockchain
truffle compile
truffle migrate --network ganache
Run the Application
Start Flask backend
cd backend
python app.py
Access the application Open your browser and navigate to:
http://localhost:5000
📖 Usage Guide
1. Upload and Register an Image
Navigate to the Upload page
Drag and drop an image or click to browse
(Optional) Enable AES-256 encryption
Click Upload & Generate Hash
Click Register on Blockchain
Confirm the transaction in MetaMask
Download your certificate of authenticity
2. Verify an Image
Method 1: Upload Image
Navigate to the Verify page
Select "Upload Image" tab
Upload the image you want to verify
Click Verify Image
View verification results
Method 2: Verify by Hash
Navigate to the Verify page
Select "Verify by Hash" tab
Paste the SHA-256 hash
Click Verify Hash
View verification results
3. View History
Navigate to the History page
View all registered images
Filter by "All", "My Images", or "Recent"
Search by hash, filename, or address
Click "View" for detailed information
Export data to CSV
🧪 Testing
Smart Contract Tests
cd blockchain
npx hardhat test
Expected output:

  ImageVerification
    ✓ Should deploy successfully
    ✓ Should register an image successfully
    ✓ Should not register duplicate image hash
    ✓ Should verify registered image
    ✓ Should track user's registered images
Manual Testing
Test Image Upload

Upload various image formats (PNG, JPG, GIF)
Test file size limits (max 16MB)
Verify hash generation
Test Blockchain Registration

Register images on local blockchain
Verify transaction success
Check gas usage
Test Verification

Verify registered images
Test with modified images
Verify tampering detection
🌐 Deployment
Deploy to Sepolia Testnet
Get Sepolia ETH

Use a faucet: https://sepoliafaucet.com/
Update .env

ETHEREUM_NODE_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
NETWORK_ID=11155111
Deploy contract
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
Verify on Etherscan (automatic in deploy script)
Deploy Backend (Production)
Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
Using Docker
docker build -t blockvision-backend .
docker run -p 5000:5000 blockvision-backend
🔒 Security Considerations
Private Keys: Never commit private keys to version control
Environment Variables: Use .env files and keep them secure
HTTPS: Always use HTTPS in production
Input Validation: All inputs are validated on backend
Rate Limiting: Implement rate limiting for API endpoints
Encryption Keys: Store encryption keys securely
Access Control: Implement proper authentication
📊 API Documentation
Upload Endpoints
POST /api/upload
Upload an image and generate hash.

Request:

Content-Type: multipart/form-data
Body: image (file), encrypt (boolean)
Response:

{
  "success": true,
  "image_hash": "abc123...",
  "filename": "image.jpg",
  "file_size": 1234567,
  "dimensions": "1920x1080",
  "format": "JPEG"
}
POST /api/register
Register image hash on blockchain.

Request:

{
  "image_hash": "abc123...",
  "filename": "image.jpg"
}
Response:

{
  "success": true,
  "transaction_hash": "0x...",
  "block_number": 12345,
  "gas_used": 123456
}
Verify Endpoints
POST /api/verify
Verify image authenticity.

Request:

Content-Type: multipart/form-data
Body: image (file)
Response:

{
  "success": true,
  "verified": true,
  "authentic": true,
  "owner": "0x...",
  "timestamp": 1234567890,
  "registration_date": "2024-01-01T00:00:00"
}
POST /api/verify-hash
Verify by hash only.

Request:

{
  "image_hash": "abc123..."
}
History Endpoints
GET /api/history/:address
Get user's registered images.

GET /api/stats
Get blockchain statistics.

GET /api/all-images?page=1&per_page=20
Get all registered images (paginated).

🛠️ Troubleshooting
Common Issues
Problem: Contract deployment fails

Solution: Ensure Ganache is running and you have sufficient ETH
Problem: MetaMask not connecting

Solution: Add localhost network to MetaMask (RPC: http://127.0.0.1:7545, Chain ID: 5777)
Problem: Image upload fails

Solution: Check file size (max 16MB) and format (PNG, JPG, JPEG, GIF, BMP, WEBP)
Problem: Transaction fails

Solution: Check gas limit and account balance
