import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), os.getenv('UPLOAD_FOLDER', 'uploads'))
    ENCRYPTED_FOLDER = os.path.join(os.path.dirname(__file__), os.getenv('ENCRYPTED_FOLDER', 'encrypted'))
    KEYS_FOLDER = os.path.join(os.path.dirname(__file__), os.getenv('KEYS_FOLDER', 'keys'))
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 16777216))  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
    
    # Retention Configuration
    RETENTION_DAYS = int(os.getenv('RETENTION_DAYS', 30))  # Delete images after 30 days
    
    # Blockchain Configuration - Hardhat Local Network
    ETHEREUM_NODE_URL = 'http://127.0.0.1:8545'
    CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    NETWORK_ID = 31337
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        # Create necessary directories
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.ENCRYPTED_FOLDER, exist_ok=True)
        os.makedirs(Config.KEYS_FOLDER, exist_ok=True)
