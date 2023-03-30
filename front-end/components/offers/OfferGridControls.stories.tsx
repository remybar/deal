import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { OfferGridControls } from "./OfferGridControls";

import { Amount, TokenSymbol } from "@/services/data.types";

export default {
  component: OfferGridControls,
} as Meta;

const onFilterSoldTokenAmount = (amount: Amount) =>
  console.log("filter 'sold token' amount: ", amount);
const onFilterSoldTokenSymbol = (symbol: TokenSymbol) =>
  console.log("filter 'sold token' symbol: ", symbol);
const onFiltertoTokenAmount = (amount: Amount) =>
  console.log("filter 'to token' amount: ", amount);
const onFiltertoTokenSymbol = (symbol: TokenSymbol) =>
  console.log("filter 'to token' symbol: ", symbol);
const onFilterOwnerOnly = (isOwnerOnly: boolean) =>
  console.log("filter owner only: ", isOwnerOnly);
const onCreate = () => console.log("on create");

export const Default: Story = (args) => (
  <OfferGridControls
    {...args.props}
    onFilterSoldTokenAmount={onFilterSoldTokenAmount}
    onFilterSoldTokenSymbol={onFilterSoldTokenSymbol}
    onFiltertoTokenAmount={onFiltertoTokenAmount}
    onFiltertoTokenSymbol={onFiltertoTokenSymbol}
    onFilterOwnerOnly={onFilterOwnerOnly}
    onCreate={onCreate}
  />
);
Default.args = {
  props: {
    soldTokenSymbols: ["USDC", "LINK"],
    toTokenSymbols: ["ETH", "MATIC"],
  },
};
