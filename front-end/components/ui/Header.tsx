import { Flex, HStack } from "@chakra-ui/react";

import { WalletSelector } from "@/components/wallet/WalletSelector";
import { FeeIndicator } from "@/components/offers/FeeIndicator";

import { Logo } from "./Logo";
import { AdminControls } from "./AdminControls";

import { useOfferService } from "@/hooks/useOfferService";

export interface HeaderProps {}
export const Header = ({ ...rest }: HeaderProps): JSX.Element => {
  const { isContractOwner, offerService } = useOfferService();
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      p={4}
      bg="brandBgHeaderAndFooter"
      color="brandColorPrimary"
      {...rest}>
      <Logo />
      <HStack gap={4}>
        {offerService && (
          <FeeIndicator
            makerFee={offerService.getMakerFee()}
            takerFee={offerService.getTakerFee()}
          />
        )}
        {isContractOwner && <AdminControls />}
        <WalletSelector />
      </HStack>
    </Flex>
  );
};
