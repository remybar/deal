import { BrowserProvider, Contract } from "ethers";

import { Address, TokenSymbol } from "./data.types";

export interface TokenMetadata {
  address: Address;
  symbol: TokenSymbol;
  decimals: number;
}

const TOKEN_ABI = [
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
];

/**
 * Get metadata (symbol and decimals) of a token from its address.
 * @param tokenAddress the token address.
 */
export const getTokenMetadata = async (
  tokenAddress: Address
): Promise<TokenMetadata> => {
  const provider = new BrowserProvider(window.ethereum);
  const contract = new Contract(tokenAddress, TOKEN_ABI, provider);
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  return {
    address: tokenAddress,
    symbol,
    decimals: Number(decimals),
  };
};

/**
 * The current user allows a spender to get an amount of token.
 * @param tokenAddress the token address
 * @param spender the address of the contract that will get the tokens.
 * @param amount the token amount.
 */
export const approveToken = async (
  tokenAddress: Address,
  spender: Address,
  amount: bigint
): Promise<void> => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(tokenAddress, TOKEN_ABI, signer);

  const allowance = await contract.allowance(signer.address, spender);

  if (amount > allowance) {
    const tx = await contract.approve(spender, amount - allowance);
    await tx.wait();
  }
};
