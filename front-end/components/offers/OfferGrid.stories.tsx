import * as React from "react";
import { Meta, Story } from "@storybook/react";

import { OfferGrid } from "./OfferGrid";

import { Offer } from "@/services/offerService";

export default {
  component: OfferGrid,
} as Meta;

const buyOffer = (offer: Offer) => console.log("buy: ", offer);
const onEditOffer = (offer: Offer) => console.log("edit: ", offer);
const cancelOffer = (offerId: number) => console.log("cancel: ", offerId);

export const Default: Story = (args) => (
  <OfferGrid
    {...args.props}
    buyOffer={buyOffer}
    onEditOffer={onEditOffer}
    cancelOffer={cancelOffer}
    currentUser="0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBBB"
  />
);
Default.args = {
  props: {
    offers: Array.from({ length: 9 }, (_, index: number) => ({
      id: index + 1,
      soldTokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      soldTokenAmount: (index + 1) * 10.0,
      soldTokenMinimalAmount: index + 1,
      soldTokenSymbol: "USDC",
      toTokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      toTokenAmount: (index + 1) * (index + 1),
      toTokenSymbol: "LINK",
      owner: "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBBB",
      reservedFor: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    })),
  },
};
