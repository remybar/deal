import { Grid, GridItem, Text } from "@chakra-ui/react";

import { OfferCard } from "./OfferCard";

import { Address } from "@/services/data.types";
import {
  Offer,
  BuyOfferFn,
  CancelOfferFn,
  EditOfferFn,
} from "@/services/offerService";

export interface OfferGridProps {
  offers: Array<Offer>;
  onEditOffer(offer: Offer): void;
  buyOffer: BuyOfferFn;
  cancelOffer: CancelOfferFn;
  currentUser: Address;
}

export const OfferGrid = ({
  offers,
  onEditOffer,
  buyOffer,
  cancelOffer,
  currentUser,
}: OfferGridProps): JSX.Element => {
  return offers.length > 0 ? (
    <Grid
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
        xl: "repeat(4, 1fr)",
      }}
      p={4}
      gap={6}>
      {offers.map((o) => (
        <GridItem key={o.id}>
          <OfferCard
            currentUser={currentUser}
            offer={o}
            onEditOffer={onEditOffer}
            buyOffer={buyOffer}
            cancelOffer={cancelOffer}
          />
        </GridItem>
      ))}
    </Grid>
  ) : (
    <Text>No offer.</Text>
  );
};
