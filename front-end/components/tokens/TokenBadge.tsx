import {
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Text,
  Badge,
  Link,
} from "@chakra-ui/react";

import { useWeb3 } from "@/hooks/useWeb3";

export interface TokenBadgeProps {
  amount: number;
  symbol: string;
  address: string;
  color: string;
}
export const TokenBadge = ({
  amount,
  symbol,
  address,
  color,
}: TokenBadgeProps): JSX.Element => {
  const { getTokenExplorerUrl } = useWeb3();

  return (
    <Flex gap={2} alignItems="center">
      <Text fontSize="sm" fontWeight="bold">
        {amount}
      </Text>
      <Badge minW={12} colorScheme={color} textAlign="center">
        <Link href={getTokenExplorerUrl(address)}>{symbol}</Link>
      </Badge>
    </Flex>
  );
};
