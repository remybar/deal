import { Flex, Text, Divider, Button, Badge, Link } from "@chakra-ui/react";

import { TokenBadge } from "@/components/tokens";
import { OfferRate } from "./OfferRate";

import { Address } from "@/services/data.types";
import {
  Offer,
  BuyOfferFn,
  isOfferOwner,
  CancelOfferFn,
} from "@/services/offerService";
import { tools } from "@/services/tools";
import { useWeb3 } from "@/hooks/useWeb3";

export interface OfferCardProps {
  offer: Offer;
  onEditOffer(offer: Offer): void;
  buyOffer: BuyOfferFn;
  cancelOffer: CancelOfferFn;
  currentUser: Address;
}

/**
 * Card to display offer details.
 */
export const OfferCard = ({
  offer,
  onEditOffer,
  buyOffer,
  cancelOffer,
  currentUser,
}: OfferCardProps): JSX.Element => {
  const { getAddressExplorerUrl } = useWeb3();

  const soldTokenAmountForOneBought =
    offer.soldTokenAmount / offer.toTokenAmount;
  const toTokenAmountForOneSold = offer.toTokenAmount / offer.soldTokenAmount;

  const _onBuyOffer = () => buyOffer(offer);
  const _onCancelOffer = () => cancelOffer(offer.id!);
  const _onEditOffer = () => onEditOffer(offer);

  return (
    <Flex
      direction="column"
      gap={2}
      p={4}
      border="1px"
      borderColor="brandColorSecondary"
      color="brandColorPrimary"
      bgColor="brandBgSecondary"
      rounded="md">
      <Flex justifyContent="space-between" alignContent="center">
        <Text fontSize="sm">SELL</Text>
        <TokenBadge
          amount={offer.soldTokenAmount}
          symbol={offer.soldTokenSymbol}
          address={offer.soldTokenAddress}
          color="blue"
        />
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="sm">BUY</Text>
        <TokenBadge
          amount={offer.toTokenAmount}
          symbol={offer.toTokenSymbol}
          address={offer.toTokenAddress}
          color="purple"
        />
      </Flex>
      <Divider />
      <Flex justifyContent="space-between" alignItems="top">
        <Text fontSize="sm">Rates</Text>
        <Flex direction="column">
          <OfferRate
            firstTokenSymbol={offer.toTokenSymbol}
            secondTokenSymbol={offer.soldTokenSymbol}
            rate={soldTokenAmountForOneBought}
          />
          <OfferRate
            firstTokenSymbol={offer.soldTokenSymbol}
            secondTokenSymbol={offer.toTokenSymbol}
            rate={toTokenAmountForOneSold}
          />
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="sm">Owner</Text>
        <Link fontSize="sm" href={getAddressExplorerUrl(offer.owner)}>
          {tools.shortenAddress(offer.owner)}
        </Link>
      </Flex>
      <Flex justifyContent="space-between">
        {offer.reservedFor &&
        tools.isSameAddress(offer.reservedFor, currentUser) ? (
          <Badge textTransform="uppercase" colorScheme="teal" my="auto">
            Reserved for you
          </Badge>
        ) : (
          !isOfferOwner(currentUser, offer) && <Text></Text>
        )}
        {isOfferOwner(currentUser, offer) ? (
          <>
            <Button bg="purple.200" size="sm" px={6} onClick={_onCancelOffer}>
              Cancel
            </Button>
            <Button bg="purple.200" size="sm" px={6} onClick={_onEditOffer}>
              Edit
            </Button>
          </>
        ) : (
          <Button bg="blue.200" size="sm" px={6} onClick={_onBuyOffer}>
            Buy
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
