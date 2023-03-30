import * as React from "react";
import { Meta, Story } from "@storybook/react";

import { Address } from "@/services/data.types";

import { TokenAddressField } from "./TokenAddressField";

export default {
  component: TokenAddressField,
} as Meta;

const onChange = (address: Address) => console.log("token address: ", address);

export const UndefinedAddress: Story = (args) => (
  <TokenAddressField {...args.props} />
);
UndefinedAddress.args = {
  props: {
    value: undefined,
    onChange,
  },
};

export const EmptyAddress: Story = (args) => (
  <TokenAddressField {...args.props} />
);
EmptyAddress.args = {
  props: {
    value: "",
    onChange,
  },
};

export const InvalidAddress: Story = (args) => (
  <TokenAddressField {...args.props} />
);
InvalidAddress.args = {
  props: {
    value: "0x1234",
    onChange,
  },
};

export const ValidAddress: Story = (args) => (
  <TokenAddressField {...args.props} />
);
ValidAddress.args = {
  props: {
    value: "0x123456789123456789123456789123456789ABCD",
    onChange,
  },
};
