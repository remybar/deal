import * as React from "react";
import { Meta, Story } from "@storybook/react";

import { Offer } from "@/services/offerService";
import { OfferCard } from "./OfferCard";

export default {
  component: OfferCard,
} as Meta;

const offer: Offer = {
  id: 1,
  soldTokenAmount: 10,
  soldTokenSymbol: "BNB",
  soldTokenAddress: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  toTokenAmount: 100,
  toTokenSymbol: "USDC",
  toTokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  owner: "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBBB",
};

const buyOffer = (offer: Offer) => console.log("buy: ", offer);
const onEditOffer = (offer: Offer) => console.log("edit: ", offer);
const cancelOffer = (offerId: number) => console.log("cancel: ", offerId);

export const WithoutReservedFor: Story = (args) => (
  <OfferCard
    {...args.props}
    buyOffer={buyOffer}
    onEditOffer={onEditOffer}
    cancelOffer={cancelOffer}
  />
);
WithoutReservedFor.args = {
  props: { currentUser: "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBBB", offer },
};

export const WithReservedFor: Story = (args) => (
  <OfferCard
    {...args.props}
    buyOffer={buyOffer}
    onEditOffer={onEditOffer}
    cancelOffer={cancelOffer}
  />
);
WithReservedFor.args = {
  props: {
    currentUser: "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBBB",
    offer: {
      ...offer,
      reservedFor: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    },
  },
};
