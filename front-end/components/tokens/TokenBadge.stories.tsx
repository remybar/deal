import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { TokenBadge, TokenBadgeProps } from "./TokenBadge";

export default {
  component: TokenBadge,
} as Meta;

const props: TokenBadgeProps = {
  amount: 10,
  symbol: "BUN",
  address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  color: "blue",
};

export const Default: Story = (args) => <TokenBadge {...args.props} />;
Default.args = {
  props,
};
