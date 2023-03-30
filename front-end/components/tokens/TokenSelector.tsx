import { useState } from "react";
import { Flex, Badge } from "@chakra-ui/react";
import { Address, TokenSymbol } from "@/services/data.types";
import { tools } from "@/services/tools";
import { getTokenMetadata } from "@/services/tokenService";
import { TokenAddressField } from "./TokenAddressField";

export interface TokenSelectorProps {
  defaultValue?: { address: Address; symbol: TokenSymbol };
  onChange(address: Address, symbol: TokenSymbol): void;
  colorScheme: string;
  readOnly?: boolean;
}
export const TokenSelector = ({
  defaultValue,
  onChange,
  colorScheme,
  readOnly = false,
}: TokenSelectorProps): JSX.Element => {
  const [tokenSymbol, setTokenSymbol] = useState<TokenSymbol>(
    defaultValue?.symbol || ""
  );
  const [tokenAddress, setTokenAddress] = useState<Address>(
    defaultValue?.address || ""
  );

  /**
   * Notifies the entered token address only when it is valid.
   */
  const _onTokenAddressChanged = (address: Address) => {
    setTokenAddress(address);

    if (tools.isAddressValid(address)) {
      getTokenMetadata(address).then((metadata) => {
        onChange(address, metadata.symbol);
        setTokenSymbol(metadata.symbol);
      });
    } else {
      onChange("", "");
      setTokenSymbol("");
    }
  };

  return (
    <Flex alignItems="center" gap={2}>
      <TokenAddressField
        value={tokenAddress}
        readOnly={readOnly}
        onChange={_onTokenAddressChanged}
      />
      {tokenSymbol !== "" && (
        <Badge minW={16} colorScheme={colorScheme} textAlign="center" p={2}>
          {tokenSymbol}
        </Badge>
      )}
    </Flex>
  );
};
