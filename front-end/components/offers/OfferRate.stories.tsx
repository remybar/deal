import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { OfferRate, OfferRateProps } from "./OfferRate";

export default {
  component: OfferRate,
} as Meta;

export const Default: Story = (args) => <OfferRate {...args.props} />;
Default.args = {
  props: { firstTokenSymbol: "USDC", secondTokenSymbol: "LINK", rate: 0.01 },
};

export const LongDecimals: Story = (args) => <OfferRate {...args.props} />;
LongDecimals.args = {
  props: {
    firstTokenSymbol: "USDC",
    secondTokenSymbol: "LINK",
    rate: 0.123456789123456789,
  },
};

export const LongNumber: Story = (args) => <OfferRate {...args.props} />;
LongNumber.args = {
  props: {
    firstTokenSymbol: "USDC",
    secondTokenSymbol: "LINK",
    rate: 123456789.0,
  },
};
