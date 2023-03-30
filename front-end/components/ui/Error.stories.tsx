import * as React from "react";
import { Meta, Story } from "@storybook/react";

import { Error } from "./Error";

export default {
  component: Error,
} as Meta;

export const Normal: Story = (args) => (
  <Error message="This is an error message" />
);
