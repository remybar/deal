import { VStack, HStack, Tooltip, Text } from "@chakra-ui/react";

interface FeeIndicatorProps {
  makerFee: number | undefined;
  takerFee: number | undefined;
}

export const FeeIndicator = ({
  makerFee,
  takerFee,
}: FeeIndicatorProps): JSX.Element => (
  <VStack alignItems="right">
    {makerFee && (
      <Tooltip label="The maker fee is paid by the seller" fontSize="md">
        <HStack justifyContent="space-between">
          <Text fontSize="xs">Maker Fee</Text>
          <Text fontSize="xs">{`${makerFee} ETH`}</Text>
        </HStack>
      </Tooltip>
    )}
    {takerFee && (
      <Tooltip label="The taker fee is paid by the buyer" fontSize="md">
        <HStack justifyContent="space-between">
          <Text fontSize="xs">Taker fee</Text>
          <Text fontSize="xs">{`${takerFee} ETH`}</Text>
        </HStack>
      </Tooltip>
    )}
  </VStack>
);
