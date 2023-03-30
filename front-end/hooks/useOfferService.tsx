/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

import { BrowserProvider, Contract } from "ethers";
import contractAbi from "@/contracts/abi/Exchange.json";

import { useWeb3, ConnectionStatus } from "./useWeb3";
import { OfferService } from "@/services/offerService";

import { tools } from "@/services/tools";

interface OfferServiceContextData {
  offerService: OfferService | undefined;
  isContractOwner: boolean;
}

interface OfferServiceContextProviderProps {
  children: ReactNode;
}

const OfferServiceContext = createContext<OfferServiceContextData>(
  {} as OfferServiceContextData
);

export const OfferServiceContextProvider = ({
  children,
}: OfferServiceContextProviderProps) => {
  const { currentUser, contractAddress, connectionStatus, selectedChain } =
    useWeb3();
  const [offerService, setOfferService] = useState<OfferService>();
  const [isContractOwner, setIsContractOwner] = useState(false);

  useEffect(() => {
    const resetService = async () => {
      if (connectionStatus === ConnectionStatus.Connected && selectedChain) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new Contract(contractAddress!, contractAbi, signer);
        const owner = await contract.owner();

        const service = new OfferService(contract, contractAddress!);
        await service.initialize();
        setOfferService(service);

        setIsContractOwner(tools.isSameAddress(owner, currentUser!));
      } else {
        setIsContractOwner(false);
      }
    };

    resetService();
  }, [connectionStatus, selectedChain, currentUser]);

  return (
    <OfferServiceContext.Provider value={{ offerService, isContractOwner }}>
      {children}
    </OfferServiceContext.Provider>
  );
};

export const useOfferService = () => {
  const context = useContext(OfferServiceContext);
  if (context === undefined) {
    throw new Error(
      'useOfferService() must be used within a "OfferServiceContext"'
    );
  }
  return context;
};
