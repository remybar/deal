/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import detectEthereumProvider from "@metamask/detect-provider";

import { Address } from "@/services/data.types";
import { contracts } from "@/contracts/contracts";

type Account = string;

export interface Chain {
  id: number;
  name: string;
}

export enum ConnectionStatus {
  Disconnected = 1,
  Connecting,
  Connected,
}

export type GetAddressExplorerUrlFn = (address: Address) => string;
export type GetTokenExplorerUrlFn = (tokenAddress: Address) => string;

interface Web3ContextData {
  currentUser: Account | undefined;
  contractAddress: Address | undefined;
  accounts: Account[];
  selectedChain: Chain | undefined;
  supportedChains: Chain[];
  errorMessage: string;
  connectionStatus: ConnectionStatus;
  getAddressExplorerUrl: GetAddressExplorerUrlFn;
  getTokenExplorerUrl: GetTokenExplorerUrlFn;
  connect: () => Promise<void>;
  disconnect: () => void;
}

interface Web3ContextProviderProps {
  supportedChains: Chain[];
  children: ReactNode;
}

const Web3Context = createContext<Web3ContextData>({} as Web3ContextData);

export const Web3ContextProvider = ({
  supportedChains,
  children,
}: Web3ContextProviderProps) => {
  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.Disconnected
  );
  const defaultGetExplorerUrl = () => "";

  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>();
  const [contractAddress, setContractAddress] = useState<Address>();
  const [getTokenExplorerUrl, setGetTokenExplorerUrl] =
    useState<GetTokenExplorerUrlFn>(() => defaultGetExplorerUrl);
  const [getAddressExplorerUrl, setGetAddressExplorerUrl] =
    useState<GetAddressExplorerUrlFn>(() => defaultGetExplorerUrl);
  const [errorMessage, setErrorMessage] = useState("");

  const _clearError = () => setErrorMessage("");
  const _cleanWalletData = () => {
    setAccounts([]);
    setSelectedChain(undefined);
    setConnectionStatus(ConnectionStatus.Disconnected);
  };

  const _updateWallet = useCallback(async (providedAccounts?: Account[]) => {
    const connectedAccounts =
      providedAccounts ||
      (await window.ethereum.request({ method: "eth_accounts" }));

    if (connectedAccounts.length === 0) {
      _cleanWalletData();
      return;
    }

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    const foundChains = supportedChains.filter(
      (c) => c.id === parseInt(chainId)
    );

    setAccounts(connectedAccounts);

    if (foundChains.length > 0) {
      const _getExplorerUrlFn = (urlPattern: string) => (address: Address) =>
        urlPattern.replace("<ADDRESS>", address);

      setSelectedChain(foundChains[0]);
      setContractAddress(contracts[foundChains[0].id].contract);
      setGetAddressExplorerUrl(defaultGetExplorerUrl);
      setGetTokenExplorerUrl(() =>
        _getExplorerUrlFn(contracts[foundChains[0].id].tokenExplorerUrl)
      );
      setGetAddressExplorerUrl(() =>
        _getExplorerUrlFn(contracts[foundChains[0].id].addressExplorerUrl)
      );
    } else {
      setSelectedChain(undefined);
      setContractAddress(undefined);
      setGetAddressExplorerUrl(() => defaultGetExplorerUrl);
      setGetTokenExplorerUrl(() => defaultGetExplorerUrl);
    }

    setSelectedChain(foundChains.length > 0 ? foundChains[0] : undefined);
    setConnectionStatus(ConnectionStatus.Connected);
  }, []);

  const onAccountChanged = useCallback(
    (accounts: Account[]) => _updateWallet(accounts),
    [_updateWallet]
  );
  const onChainChanged = useCallback(() => _updateWallet(), [_updateWallet]);

  useEffect(() => {
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });

      if (provider) {
        _updateWallet();
        window.ethereum.on("accountsChanged", onAccountChanged);
        window.ethereum.on("chainChanged", onChainChanged);
      } else {
        setErrorMessage("Please install a wallet");
      }
    };

    getProvider();

    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccountChanged);
      window.ethereum?.removeListener("chainChanged", onChainChanged);
    };
  }, [_updateWallet]);

  const connect = async () => {
    setConnectionStatus(ConnectionStatus.Connecting);
    _clearError();

    try {
      const connectedAccounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      _updateWallet(connectedAccounts);
    } catch (err: any) {
      setConnectionStatus(ConnectionStatus.Disconnected);
    }
  };
  const disconnect = () => _cleanWalletData();

  return (
    <Web3Context.Provider
      value={{
        currentUser: accounts && accounts[0],
        accounts,
        selectedChain,
        supportedChains,
        contractAddress,
        errorMessage,
        connectionStatus,
        getTokenExplorerUrl,
        getAddressExplorerUrl,
        connect,
        disconnect,
      }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3() must be used within a "Web3Context"');
  }
  return context;
};
