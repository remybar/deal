import * as React from "react";
import { Meta, Story } from "@storybook/react";

import { OfferList } from "./OfferList";

import { Offer } from "@/services/offerService";

export default {
  component: OfferList,
} as Meta;

const buyOffer = (offer: Offer) => console.log("buy: ", offer);
const onEditOffer = (offer: Offer) => console.log("edit: ", offer);
const cancelOffer = (offerId: number) => console.log("cancel: ", offerId);

export const Default: Story = (args) => (
  <OfferList
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
      owner:
        index > 7
          ? "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
          : "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBBB",
      reservedFor:
        index > 7
          ? "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBBB"
          : "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    })),
  },
};
