const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    // Development network (Ganache)
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 6721975,
      gasPrice: 20000000000
    },

    // Ganache CLI
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6721975
    },

    // Sepolia Testnet
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 11155111,
      gas: 4000000,
      gasPrice: 10000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    // Goerli Testnet
    goerli: {
      provider: () => new HDWalletProvider(
        process.env.PRIVATE_KEY,
        `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 5,
      gas: 4000000,
      gasPrice: 10000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // Truffle DB (optional)
  db: {
    enabled: false
  },

  // Contract directory
  contracts_directory: '../backend/contracts',
  contracts_build_directory: './build/contracts',

  // Plugins
  plugins: ['truffle-plugin-verify'],

  // API keys for verification
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};
