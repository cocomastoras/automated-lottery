require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  gasReporter: {
    enabled: true,
  },
  networks: {
    hardhat: {
    },
    anvil: {
      url: "http://127.0.0.1:8545/",
      launch: false, // if set to `true`, it will spawn a new instance if the plugin is initialized, if set to `false` it expects an already running anvil instance
    },
    polygon_mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: ['']
    },
    binance: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: ['']
    },
    arbitrum_goerli: {
      url: 'https://arbitrum-goerli.blockpi.network/v1/rpc/public',
      accounts: ['']
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: ''
    }
  },
};
