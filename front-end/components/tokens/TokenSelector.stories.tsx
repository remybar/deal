import * as React from "react";
import { Meta, Story } from "@storybook/react";

import { Address } from "@/services/data.types";

import { TokenSelector } from "./TokenSelector";

export default {
  component: TokenSelector,
} as Meta;

const onChange = (address: Address) => console.log("token address: ", address);

export const Default: Story = (args) => <TokenSelector {...args.props} />;
Default.args = {
  props: {
    onChange,
    colorScheme: "green",
  },
};
