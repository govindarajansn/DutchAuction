import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const INFURA_API_KEY = "6c82fb9640644c9f8a93f6ede7b47ed0";

const SEPOLIA_PRIVATE_KEY = "5a1ab9c5dd9edcd2817e614b9057f6586b8026bcc1d0198cc4a2704af94b8b1a";

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    }
  },
};
