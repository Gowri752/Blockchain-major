// Web3 Initialization and Wallet Connection
// Handles MetaMask and Web3 interactions

class Web3Handler {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contract = null;
        this.contractAddress = null;
        this.contractABI = null;
    }

    // Check if MetaMask is installed
    isMetaMaskInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    // Initialize Web3
    async init() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error('MetaMask is not installed. Please install MetaMask to use blockchain features.');
        }

        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Initialize Web3
            this.web3 = new Web3(window.ethereum);
            
            // Get current account
            const accounts = await this.web3.eth.getAccounts();
            this.account = accounts[0];

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.account = accounts[0];
                this.onAccountChanged(accounts[0]);
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            return this.account;
        } catch (error) {
            console.error('Web3 initialization error:', error);
            throw error;
        }
    }

    // Connect wallet
    async connectWallet() {
        try {
            const account = await this.init();
            return account;
        } catch (error) {
            if (error.code === 4001) {
                throw new Error('Please connect your wallet to continue');
            }
            throw error;
        }
    }

    // Load contract
    async loadContract(contractAddress, contractABI) {
        if (!this.web3) {
            await this.init();
        }

        this.contractAddress = contractAddress;
        this.contractABI = contractABI;
        this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
        
        return this.contract;
    }

    // Get current account
    async getCurrentAccount() {
        if (this.account) {
            return this.account;
        }

        if (!this.web3) {
            await this.init();
        }

        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        return this.account;
    }

    // Get balance
    async getBalance(address = null) {
        if (!this.web3) {
            await this.init();
        }

        const targetAddress = address || this.account;
        const balance = await this.web3.eth.getBalance(targetAddress);
        return this.web3.utils.fromWei(balance, 'ether');
    }

    // Register image on blockchain (via contract)
    async registerImage(imageHash, fileName) {
        if (!this.contract) {
            throw new Error('Contract not loaded');
        }

        if (!this.account) {
            await this.init();
        }

        try {
            const tx = await this.contract.methods
                .registerImage(imageHash, fileName)
                .send({ from: this.account });

            return tx;
        } catch (error) {
            console.error('Blockchain registration error:', error);
            throw error;
        }
    }

    // Verify image on blockchain (via contract)
    async verifyImage(imageHash) {
        if (!this.contract) {
            throw new Error('Contract not loaded');
        }

        try {
            const result = await this.contract.methods
                .getImageDetails(imageHash)
                .call();

            return {
                exists: result[0],
                owner: result[1],
                timestamp: result[2],
                fileName: result[3]
            };
        } catch (error) {
            console.error('Blockchain verification error:', error);
            throw error;
        }
    }

    // Get user's registered images
    async getUserImages(address = null) {
        if (!this.contract) {
            throw new Error('Contract not loaded');
        }

        const targetAddress = address || this.account;
        
        try {
            const imageHashes = await this.contract.methods
                .getUserImages(targetAddress)
                .call();

            return imageHashes;
        } catch (error) {
            console.error('Error fetching user images:', error);
            throw error;
        }
    }

    // Get total registered images
    async getTotalImages() {
        if (!this.contract) {
            throw new Error('Contract not loaded');
        }

        try {
            const total = await this.contract.methods
                .getTotalImages()
                .call();

            return parseInt(total);
        } catch (error) {
            console.error('Error fetching total images:', error);
            throw error;
        }
    }

    // Event callback for account change
    onAccountChanged(newAccount) {
        console.log('Account changed:', newAccount);
        // You can dispatch a custom event here if needed
        window.dispatchEvent(new CustomEvent('accountChanged', { detail: { account: newAccount } }));
    }

    // Switch network
    async switchNetwork(chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.web3.utils.toHex(chainId) }],
            });
        } catch (error) {
            // This error code indicates that the chain has not been added to MetaMask
            if (error.code === 4902) {
                throw new Error('Please add this network to MetaMask');
            }
            throw error;
        }
    }

    // Add network to MetaMask
    async addNetwork(networkConfig) {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [networkConfig],
            });
        } catch (error) {
            console.error('Error adding network:', error);
            throw error;
        }
    }
}

// Create global instance
window.Web3Handler = new Web3Handler();

// Auto-connect if previously connected
window.addEventListener('load', async () => {
    if (window.Web3Handler.isMetaMaskInstalled()) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                // User is already connected
                await window.Web3Handler.init();
                
                // Update connect button if exists
                const connectBtn = document.getElementById('connectWallet');
                if (connectBtn && window.Utils) {
                    connectBtn.innerHTML = `
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="6" width="18" height="13" rx="2"/>
                            <path d="M3 10h18"/>
                        </svg>
                        <span>${window.Utils.formatAddress(accounts[0])}</span>
                    `;
                }
            }
        } catch (error) {
            console.error('Auto-connect error:', error);
        }
    }
});
