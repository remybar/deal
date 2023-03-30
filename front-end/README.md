# Deal (Front-End)

The front-end of the `Deal` project, written in [Typescript](https://www.typescriptlang.org/) using [NextJS](https://nextjs.org/) and [Chakra-UI](https://chakra-ui.com/).

This front-end is built around a single page which shows all the available offers as a `grid` of offer cards or as a `list`.

## Supported Networks

This front-end supports several networks.

As explained in the [README](../smart-contracts/README.md) file of the smart-contract section, each time a smart contract is deployed on a network, the [contracts.ts](contracts/contracts.ts) front-end file is updated with the network identification (`chainID` and `name`) and the deployed contract `address`.

This file is parsed at front-end start-up to initialize a `Web3ContextProvider` (see [Hooks](#hooks) section).
That means, the supported network list is automatically computed from the [contracts.ts](contracts/contracts.ts).

## Hooks

### [useWeb3](hooks/useWeb3.tsx)

The [useWeb3](hooks/useWeb3.tsx) hook encapsulates the logic of connecting the front-end with a web wallet like [MetaMask](https://metamask.io/). That means, connecting to an account, disconnecting, switching of accounts, switching of networks...

This hook provides:

- the `connect` and `disconnect` functions to initiate/stop the connection with the web wallet.
- `connectionStatus`, the current connection status so `Disconnected`, `Connecting` or `Connected`,
- `accounts` which is the list of wallets connected to the front-end.
- `currentUser` which is the first account of `accounts`, representing the current user of the dApp.
- `selectedChain`, the current chain ID (i.e the network).
- `supportedChains` the list of supported networks, loaded from [contracts.ts](contracts/contracts.ts),
- `errorMessage`, a message describing the error if something went wrong while using the web wallet.
- `getTokenExplorerUrl` and `getAddressExplorerUrl` which are 2 functions to provide a URL of the current network explorer for a token address or an user address.

### [useOfferService](hooks/useOfferService.tsx)

The `useOfferService` manages the initialisation and refreshing of a [OfferService](services/offerService.ts) instance according to any modification of the web wallet connection state (connection/disconnection, account switching, network switching, ...).

This hook provides:

- an up-to-date `offerService` instance, to be able to call any method of the Offer smart contract,
- `isContractOwner` which indicates if the current user is the owner of the smart contract, to be able to activate some admin features in the front-end.

## Usage

There is nothing special to know to run this front-end:

- `npm run dev` to run it locally for testing,
- `npm run build && npm run start` to build it and run it on a server.
