import { ethers } from "ethers";
import { Address, Amount } from "./data.types";

const FLOAT_AMOUNT_PRECISION = 10 ** 6;

/**
 * Round a number to a number of decimals.
 * @param value the number to round
 * @param decimals the number of expected decimals
 * @returns the rounded number.
 */
const roundDecimals = (value: number, decimals: number) => {
  const rounder = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * rounder) / rounder;
};

/**
 * Convert a number to its scientific notation like 1.23e-6, rounded
 * to a number of decimals, using a number of digits for precision.
 * @param value the number to convert.
 * @param precision the number of digits to use.
 * @param decimals the number of decimals.
 * @returns the converted number.
 */
const scientificNotation = (
  value: number,
  precision: number,
  decimals: number
) => Number.parseFloat(value.toPrecision(precision)).toExponential(decimals);

/**
 * Shorten an addres to the form '0x1234...ABCD'
 * @param address the address to shorten.
 * @returns the shortened address.
 */
const shortenAddress = (address: Address): string => {
  const re = /^(0x[a-zA-Z0-9]{2})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  const match = address.match(re);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

/**
 * Format an amount to a short human-readable string like:
 * ° 0.00000123645 becomes 1.24e-6
 * ° 1234567 becomes 1.2346M
 * ...
 * @param amount the amount to convert.
 * @returns the converted amount.
 */
const formatAmount = (amount: Amount): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toPrecision(5)}M`;
  if (amount >= 100000) return `${(amount / 1000).toPrecision(5)}K`;
  if (amount > 1)
    return (Number.parseFloat(amount.toPrecision(5)) / 1).toString();
  if (amount < 0.01) return scientificNotation(amount, 3, 2);
  return (Number.parseFloat(amount.toPrecision(4)) / 1).toString();
};

/**
 * Indicates if the provided address is valid.
 */
const isAddressValid = (address: Address | undefined) =>
  address && ethers.isAddress(address);

/**
 * Indicates if an amount is valid.
 */
const isAmountValid = (amount: Amount | undefined) => amount && amount > 0;

/**
 * Convert a raw integer amount coming from a blockchain, into a human readable float amount.
 * @param amount the raw amount.
 * @param decimals number of decimals defined for the token associated to the amount.
 * @returns the float amount.
 */
const fromRawAmount = (amount: bigint, decimals: number): number => {
  return (
    Number(
      BigInt(amount * BigInt(FLOAT_AMOUNT_PRECISION)) / BigInt(10 ** decimals)
    ) / FLOAT_AMOUNT_PRECISION
  );
};

/**
 * Convert a human readable float amount into a raw integer amount to be provided to a blockchain.
 * @param amount the human readable amount.
 * @param decimals number of decimals defined for the token associated to the amount.
 * @returns the raw integer amount.
 */
const toRawAmount = (amount: number, decimals: number): bigint => {
  return BigInt(amount * 10 ** decimals);
};

/**
 * Check if two addressses are identical.
 * @param addr1 the first address.
 * @param addr2 the second address.
 */
const isSameAddress = (addr1: Address, addr2: Address) =>
  addr1.toLowerCase() === addr2.toLowerCase();

export const tools = {
  roundDecimals,
  scientificNotation,
  shortenAddress,
  formatAmount,
  isAddressValid,
  isAmountValid,
  fromRawAmount,
  toRawAmount,
  isSameAddress,
};
