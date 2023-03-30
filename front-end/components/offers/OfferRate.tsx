import { Flex, Text } from "@chakra-ui/react";

import { TokenSymbol, Amount } from "@/services/data.types";
import { tools } from "@/services/tools";

export interface OfferRateProps {
  firstTokenSymbol: TokenSymbol;
  secondTokenSymbol: TokenSymbol;
  rate: Amount;
}
export const OfferRate = ({
  firstTokenSymbol,
  secondTokenSymbol,
  rate,
}: OfferRateProps) => (
  <Flex fontSize="xs" gap={8} justifyContent="space-between">
    <Text>{`1 ${firstTokenSymbol}`}</Text>
    <Text>{`~ ${tools.formatAmount(rate)} ${secondTokenSymbol}`}</Text>
  </Flex>
);
