require("dotenv/config");
require("@nomicfoundation/hardhat-chai-matchers");
require("solidity-coverage");
require("hardhat-abi-exporter");

const { deployFixtures } = require("./tasks/fixtures");
const { getOffers } = require("./tasks/offers");
const { getContractState } = require("./tasks/contractState");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("fixtures", "Deploy some fixtures for tests")
  .addParam("exchange", "The exchange's address")
  .setAction(async (taskArgs, hre) => {
    if (!taskArgs?.exchange) {
      console.log("Please provide the Exchange contract address");
      return;
    }

    await deployFixtures(taskArgs.exchange);
  });

task("offers", "Get existing offers")
  .addParam("exchange", "The exchange's address")
  .setAction(async (taskArgs, hre) => {
    if (!taskArgs?.exchange) {
      console.log("Please provide the Exchange contract address");
      return;
    }

    await getOffers(taskArgs.exchange);
  });

task("contract_state", "Get the current contract state")
  .addParam("exchange", "The exchange's address")
  .setAction(async (taskArgs, hre) => {
    if (!taskArgs?.exchange) {
      console.log("Please provide the Exchange contract address");
      return;
    }

    await getContractState(taskArgs.exchange);
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.21",
  mocha: {
    reporter: process.env.MOCHA_REPORTER || "spec",
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_API_KEY}`,
      tokenExplorerUrl: "https://goerli.etherscan.io/token/<ADDRESS>",
      addressExplorerUrl: "https://goerli.etherscan.io/address/<ADDRESS>",
      accounts: [process.env.GOERLI_PRIVATE_KEY],
      chainId: 5,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_API_KEY}`,
      tokenExplorerUrl: "https://sepolia.etherscan.io/token/<ADDRESS>",
      addressExplorerUrl: "https://sepolia.etherscan.io/address/<ADDRESS>",
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
    },
  },

  frontEnd: {
    contractFile: "../front-end/contracts/contracts.ts",
  },
  // export smart contract ABI to the front-end
  abiExporter: {
    path: "../front-end/contracts/abi",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [":Exchange$"],
    spacing: 2,
    format: "minimal",
  },
};
