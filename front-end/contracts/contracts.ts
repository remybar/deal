export interface Contract {
  chainId: number;
  tokenExplorerUrl: string;
  addressExplorerUrl: string;
  networkName: string;
  contract: string;
}

export interface Chain {
  id: number;
  name: string;
}

export const contracts: Record<number, Contract> = {
  // generated content :: DO NOT MODIFIED :: BEGIN
  5: {
    chainId: 5,
    tokenExplorerUrl: 'https://goerli.etherscan.io/token/<ADDRESS>',
    addressExplorerUrl: 'https://goerli.etherscan.io/address/<ADDRESS>',
    networkName: 'Goerli',
    contract: '0x66887d4660162D3B5568066e59CE0462bb5378B4'
  },
  11155111: {
    chainId: 11155111,
    tokenExplorerUrl: 'https://sepolia.etherscan.io/token/<ADDRESS>',
    addressExplorerUrl: 'https://sepolia.etherscan.io/address/<ADDRESS>',
    networkName: 'Sepolia',
    contract: '0xD83dE81E22cF06dFc9CC2ca7Dd664b5Ee2bf6e6A'
  },
  31337: {
    chainId: 31337,
    tokenExplorerUrl: '',
    addressExplorerUrl: '',
    networkName: 'Localhost',
    contract: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  },
  1802203764: {
    chainId: 1802203764,
    tokenExplorerUrl: 'https://sepolia.kakarotscan.org/token/<ADDRESS>',
    addressExplorerUrl: 'https://sepolia.kakarotscan.org/address/<ADDRESS>',
    networkName: 'Kakarot',
    contract: '0xD83dE81E22cF06dFc9CC2ca7Dd664b5Ee2bf6e6A'
  },
  // generated content :: DO NOT MODIFIED :: END
};

export const getSupportedChains = (): Chain[] =>
  Object.values(contracts).map((c: Contract) => ({
    id: c.chainId,
    name: c.networkName,
  }));
