require("@nomicfoundation/hardhat-ethers");
module.exports = {
  solidity: "0.8.30",
  networks: {
    ethLocal:   { url: "http://127.0.0.1:8545" },
    hexosLocal: {
      url: "http://127.0.0.1:8546",
      // Disable EIP-1559 base fee so we can force a fixed gasPrice
      initialBaseFeePerGas: 0,
      // Optional: cap block gas to avoid accidental spam
      blockGasLimit: 30_000_000
    },
  },
};
