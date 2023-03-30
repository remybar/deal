import type { Meta, StoryObj } from "@storybook/react";

import { Web3ContextProvider } from "@/hooks/useWeb3";
import { Chain } from "@/hooks/useWeb3";

import { WalletSelector } from "./WalletSelector";

const SUPPORTED_CHAINS: Array<Chain> = [
  {
    id: 1,
    name: "Ethereum",
  },
  {
    id: 31337,
    name: "Localhost",
  },
];

const meta: Meta<typeof WalletSelector> = {
  component: WalletSelector,
  decorators: [
    (Story) => (
      <Web3ContextProvider supportedChains={SUPPORTED_CHAINS}>
        <Story />
      </Web3ContextProvider>
    ),
  ],
};
type Story = StoryObj<typeof WalletSelector>;

export const Default: Story = () => {
  return <WalletSelector />;
};
Default.args = {};

export default meta;
