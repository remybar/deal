import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { OfferContainer } from "./OfferContainer";

import { Address } from "@/services/data.types";
import { Offer } from "@/services/offerService";

export default {
  component: OfferContainer,
} as Meta;

const tokens = [
  "USDC",
  "USDT",
  "ETH",
  "MATIC",
  "LINK",
  "IMX",
  "FTM",
  "AVAX",
  "AAVE",
];

const owners = [
  "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBB1",
  "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBB2",
  "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBB3",
  "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBB4",
  "0xAAAA6991c6218b36c1d19d4a2e9eb0ce3606BBB5",
];

const _r = (max: number) => Math.floor(Math.random() * max);
const randomToken = () => tokens[_r(tokens.length - 1)];
const randomOwner = () => owners[_r(owners.length - 1)];

const buyOffer = (offer: Offer) => console.log("buy: ", offer);
const createOffer = (
  fromToken: Address,
  fromAmount: number,
  toToken: Address,
  toAmount: number,
  reservedFor?: Address
) =>
  console.log(
    "create: ",
    fromToken,
    fromAmount,
    toToken,
    toAmount,
    reservedFor
  );
const editOffer = (
  id: number,
  fromToken: Address,
  fromAmount: number,
  toToken: Address,
  toAmount: number,
  reservedFor?: Address
) =>
  console.log(
    "edit: ",
    id,
    fromToken,
    fromAmount,
    toToken,
    toAmount,
    reservedFor
  );
const cancelOffer = (offerId: number) => console.log("cancel: ", offerId);

export const Empty: Story = (args) => (
  <OfferContainer
    {...args.props}
    buyOffer={buyOffer}
    createOffer={createOffer}
    editOffer={editOffer}
    cancelOffer={cancelOffer}
    currentUser={owners[0]}
  />
);
Empty.args = {
  props: {
    offers: [],
  },
};

export const SeveralOffers: Story = (args) => (
  <OfferContainer
    {...args.props}
    buyOffer={buyOffer}
    createOffer={createOffer}
    editOffer={editOffer}
    cancelOffer={cancelOffer}
    currentUser={owners[0]}
  />
);
SeveralOffers.args = {
  props: {
    offers: Array.from({ length: 9 }, (_, index: number) => ({
      id: index + 1,
      soldTokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      soldTokenAmount: (index + 1) * 10.0,
      soldTokenMinimalAmount: index + 1,
      soldTokenSymbol: randomToken(),
      toTokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      toTokenAmount: (index + 1) * (index + 1),
      toTokenSymbol: randomToken(),
      owner: randomOwner(),
      reservedFor: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    })),
  },
};
