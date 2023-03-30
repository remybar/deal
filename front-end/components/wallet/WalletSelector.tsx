import { Button, Text, HStack } from "@chakra-ui/react";

import { useWeb3, ConnectionStatus } from "@/hooks/useWeb3";
import { tools } from "@/services/tools";

export const WalletSelector = (): JSX.Element => {
  const {
    accounts,
    selectedChain,
    errorMessage,
    connectionStatus,
    connect,
    disconnect,
  } = useWeb3();

  const onConnect = async () => await connect();
  const onDisconnect = async () => disconnect();

  const colorScheme =
    connectionStatus === ConnectionStatus.Connected ? "purple" : "blue";

  return !!errorMessage ? (
    <Text bg="red.500" color="white" p={2} rounded="lg" fontWeight="bold">
      {errorMessage}
    </Text>
  ) : (
    <HStack gap={4} bg="brandBgHeaderAndFooter">
      {connectionStatus === ConnectionStatus.Connected && (
        <Text
          py={2}
          px={4}
          fontWeight="bold"
          color={selectedChain ? "blue.400" : "red.400"}
          bgColor="brandBgPrimary"
          borderWidth="2px"
          borderRadius="lg"
          borderColor={selectedChain ? "blue.600" : "red.600"}>
          {selectedChain?.name || "Not supported"}
        </Text>
      )}
      <Button
        px={8}
        variant={
          connectionStatus === ConnectionStatus.Connected ? "ghost" : "solid"
        }
        color={`${colorScheme}.300`}
        bgColor="brandBgPrimary"
        _hover={{
          bg: `${colorScheme}.600`,
          color: `${colorScheme}.100`,
          borderColor: `${colorScheme}.600`,
        }}
        borderWidth="2px"
        borderRadius="lg"
        borderColor={`${colorScheme}.600`}
        onClick={
          connectionStatus === ConnectionStatus.Connected
            ? onDisconnect
            : onConnect
        }>
        {connectionStatus === ConnectionStatus.Connected
          ? tools.shortenAddress(accounts[0])
          : "Connect"}
      </Button>
    </HStack>
  );
};
