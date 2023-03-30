import * as React from "react";
import { Meta, Story } from "@storybook/react";

import { AddEditOffer } from "./AddEditOffer";

export default {
  component: AddEditOffer,
} as Meta;

export const Default: Story = (args) => <AddEditOffer {...args.props} />;
Default.args = {
  props: {
    isOpen: true,
    onClose: () => {},
  },
};
