# Deal (Smart Contract)

The smart contracts of the `Deal` project, written in [Solidity](https://soliditylang.org/).

[Exchange](contracts/Exchange.sol) is the smart-contract of the `Deal` project. It implements the management of offers, using the [Offers](contracts/libraries/Offers) library.

This [Offers](contracts/libraries/Offers) library is inspired from [EnumerableSet](https://docs.openzeppelin.com/contracts/4.x/api/utils#EnumerableSet) of [OpenZeppelin](https://www.openzeppelin.com/), and allows to manage offers using an efficient data structure.

Both these contracts are fully tested in [test](test/).

Code coverage report may be generated using the `npm run test && npm run coverage` command. The result will be in a `coverage` folder.

## Configuration

First of all, you have to configure all the networks you want to support in [hardhat.config.json](./hardhat.config.js).
For each network, the following parameters are mandatory:

- `chainId`: the network chain ID.
- `tokenExplorerUrl`, a URL pattern to see a token address in the network explorer like https://goerli.etherscan.io/token/\<ADDRESS\>.
- `addressExplorerUrl` : a URL pattern to see an user address in the network explorer like https://goerli.etherscan.io/address/\<ADDRESS\>.

_Note: At the moment, only `Goerli` and `Sepolia` are configured (for testnet deploy). The `localhost` network may be used for local tests but without any blockchain explorer._

Then, according to configured networks, you have to define the corresponding keys in a `.env` file.

_Note: The [.env-template](.env-template) file could be copied/pasted to create a `.env` file corresponding to the default [hardhat.config.json](./hardhat.config.json)_

## Deploy

The [deploy.js](scripts/deploy.js) script allows you to deploy the `Exchange` smart contract.

You can set-up maker and taker fees directly in this script at deploy, or later by calling `setMakerFee` and `setTakerFee` smart contract functions.

Once deployed, this script will automatically transfer the generated ABI file and update the [contracts.ts](../front-end/contracts/contracts.ts) file in the `front-end/contract` folder with the current network (`chainID` and `name`) and the deployed smart-contract address.

## Hardhat Tasks

Some [HardHat](https://hardhat.org/) `tasks` have been written.

### [Fixtures](tasks/fixtures.js) (for local tests only)

This task allows to deploy some fake tokens and offers to be able to test the front-end faster.

usage: `npx hardhat fixtures --network localhost --exchange <EXCHANGE_ADDRESS>`

### [Offers](tasks/offers.js)

Get the list of existing offers.

usage: `npx hardhat offers --network <NETWORK_NAME> --exchange <EXCHANGE_ADDRESS>`

### [Contract State](tasks/contractState.js)

Get the current contract state (ETH balance and number of offers).

usage: `npx hardhat contract_state --network <NETWORK_NAME> --exchange <EXCHANGE_ADDRESS>`
