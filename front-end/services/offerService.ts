import { ethers } from "ethers";

import { Address, Amount, TokenSymbol } from "./data.types";
import { TokenMetadata, getTokenMetadata, approveToken } from "./tokenService";
import { tools } from "./tools";

const DEFAULT_DECIMALS = 18;
const DEFAULT_SYMBOL = "-";

const GAS_TOKEN_DECIMALS = 18;

const SOLD_TOKEN_INDEX = 2;
const TO_TOKEN_INDEX = 4;

/**
 * Offer structure coming from the smart contract.
 */
type OfferFromContract = [
  number,
  Address,
  Address,
  bigint,
  Address,
  bigint,
  Address
];

/**
 * Offer type used in the front-end.
 */
export interface Offer {
  id?: number;
  soldTokenAddress: Address;
  soldTokenAmount: Amount;
  soldTokenSymbol: TokenSymbol;
  toTokenAddress: Address;
  toTokenAmount: Amount;
  toTokenSymbol: TokenSymbol;
  owner: Address;
  reservedFor?: Address;
}

export type BuyOfferFn = (offer: Offer) => Promise<void>;

export type CreateOfferFn = (
  fromToken: Address,
  fromAmount: number,
  toToken: Address,
  toAmount: number,
  reservedFor?: Address
) => Promise<void>;

export type EditOfferFn = (
  id: number,
  fromToken: Address,
  fromAmount: number,
  toToken: Address,
  toAmount: number,
  reservedFor?: Address
) => Promise<void>;

export type CancelOfferFn = (offerId: number) => Promise<void>;

export type OfferRemovedListener = (offerId: number) => void;
export type OfferCreatedListener = (offerId: number) => void;

/**
 * Indicates if an user address matches with an offer owner.
 * @param user the user address
 * @param offer the offer
 */
export const isOfferOwner = (
  user: Address | undefined,
  offer: Offer
): boolean => !!user && tools.isSameAddress(offer.owner, user);

/**
 * Offer services provided by the smart-contract.
 */
export class OfferService {
  contract: ethers.Contract;
  contractAddress: Address;
  makerFee: bigint;
  takerFee: bigint;

  constructor(contract: ethers.Contract, contractAddress: Address) {
    this.contract = contract;
    this.contractAddress = contractAddress;
    this.makerFee = 0n;
    this.takerFee = 0n;
  }

  /**
   * This method allows to do some async calls to initialise some service fields
   * (which is not possible in the constructor).
   */
  async initialize() {
    this.makerFee = await this.contract.makerFees();
    this.takerFee = await this.contract.takerFees();
  }

  /**
   * attach listeners for smart contract events.
   * @param onOfferRemoved listener for 'OfferRemoved' event.
   * @param onOfferCreated listener for 'OfferCreated' event.
   */
  attachListeners(
    onOfferRemoved: OfferRemovedListener,
    onOfferCreated: OfferCreatedListener
  ) {
    this.contract.on("OfferRemoved", onOfferRemoved);
    this.contract.on("OfferCreated", onOfferCreated);
  }

  /**
   * Convert an offer received from the smart-contract to a "front-end" offer.
   */
  _convertOffer(
    [
      id,
      owner,
      soldTokenAddress,
      soldTokenAmount,
      toTokenAddress,
      toTokenAmount,
      reservedFor,
    ]: OfferFromContract,
    soldTokenMetadata: TokenMetadata,
    toTokenMetadata: TokenMetadata
  ): Offer {
    return {
      id,
      owner,
      soldTokenAddress,
      soldTokenAmount: tools.fromRawAmount(
        soldTokenAmount,
        soldTokenMetadata.decimals || DEFAULT_DECIMALS
      ),
      soldTokenSymbol: soldTokenMetadata.symbol || DEFAULT_SYMBOL,
      toTokenAddress,
      toTokenAmount: tools.fromRawAmount(
        toTokenAmount,
        toTokenMetadata.decimals || DEFAULT_DECIMALS
      ),
      toTokenSymbol: toTokenMetadata.symbol || DEFAULT_SYMBOL,
      reservedFor: reservedFor !== ethers.ZeroAddress ? reservedFor : undefined,
    };
  }

  /**
   * Convert a human readable amount to a raw integer amount.
   * @param token the token address associated to the amount.
   * @param amount the human readable amount.
   */
  async _convertTokenAmount(token: Address, amount: number) {
    const metadata = await getTokenMetadata(token);
    return tools.toRawAmount(amount, metadata.decimals);
  }

  /**
   * Get the list of tokens with their metadata, used in offers.
   * @param offers the full list of offers.
   * @returns the list of tokens.
   */
  async _getTokensFromOffers(
    offers: Array<OfferFromContract>
  ): Promise<Array<TokenMetadata>> {
    const tokenAddresses = offers.reduce(
      (result: Array<Address>, [, , token1, , token2]) => [
        ...result,
        ...(result.includes(token1) ? [] : [token1]),
        ...(result.includes(token2) ? [] : [token2]),
      ],
      []
    );
    return Promise.all(tokenAddresses.map((a) => getTokenMetadata(a)));
  }

  /**
   * Get the current smart contract ETH balance.
   */
  async getCurrentBalance() {
    if (this.contract.runner?.provider) {
      const balance = await this.contract.runner.provider.getBalance(
        this.contractAddress
      );
      return balance ? Number(ethers.formatEther(balance)) : 0;
    }
    return 0;
  }

  getMakerFee() {
    return tools.fromRawAmount(this.makerFee, GAS_TOKEN_DECIMALS);
  }

  getTakerFee() {
    return tools.fromRawAmount(this.takerFee, GAS_TOKEN_DECIMALS);
  }

  /**
   * Get the list of offers from the smart contract.
   */
  async getOffers(): Promise<Offer[]> {
    const offers: Array<OfferFromContract> = await this.contract.getOffers();
    const tokens = await this._getTokensFromOffers(offers);
    const tokenMap = new Map(tokens.map((t) => [t.address, t]));

    return offers.map((o: OfferFromContract) =>
      this._convertOffer(
        o,
        tokenMap.get(o[SOLD_TOKEN_INDEX] as Address)!,
        tokenMap.get(o[TO_TOKEN_INDEX] as Address)!
      )
    );
  }

  /**
   * Create a new offer.
   */
  async createOffer(
    fromToken: Address,
    fromAmount: number,
    toToken: Address,
    toAmount: number,
    reservedFor?: Address
  ) {
    const fromRawAmount = await this._convertTokenAmount(fromToken, fromAmount);
    const toRawAmount = await this._convertTokenAmount(toToken, toAmount);

    // allows the offer smart contract to get an amount of tokens from the current user account
    await approveToken(fromToken, this.contractAddress, fromRawAmount);

    // then, create the offer
    const offer = [fromToken, fromRawAmount, toToken, toRawAmount];

    const tx = reservedFor
      ? await this.contract.createReservedOffer(...offer, reservedFor, {
          value: this.makerFee,
        })
      : await this.contract.createOffer(...offer, { value: this.makerFee });
    await tx.wait();
  }

  /**
   * Edit an existing offer.
   */
  async editOffer(
    id: number,
    fromToken: Address,
    fromAmount: number,
    toToken: Address,
    toAmount: number,
    reservedFor?: Address
  ) {
    const fromRawAmount = await this._convertTokenAmount(fromToken, fromAmount);
    const toRawAmount = await this._convertTokenAmount(toToken, toAmount);

    const oldOffer = await this.contract.getOffer(id);
    const [_ignore1, _ignore2, _ignore3, oldFromTokenAmount, ..._rest] =
      oldOffer;

    // don't forget to approve token spending if the amount is greater than the original
    if (fromRawAmount > oldFromTokenAmount) {
      await approveToken(
        fromToken,
        this.contractAddress,
        fromRawAmount - oldFromTokenAmount
      );
    }

    // then, edit the offer
    const offer = [id, fromRawAmount, toToken, toRawAmount];

    const tx = reservedFor
      ? await this.contract.editReservedOffer(...offer, reservedFor)
      : await this.contract.editOffer(...offer);
    await tx.wait();
  }

  /**
   * Cancel an existing offer.
   */
  async cancelOffer(offerId: number) {
    const tx = await this.contract.cancelOffer(offerId);
    await tx.wait();
  }

  /**
   * Buy an offer.
   */
  async buyOffer(offer: Offer) {
    const toTokenMetadata = await getTokenMetadata(offer.toTokenAddress);
    const toRawAmount = tools.toRawAmount(
      offer.toTokenAmount,
      toTokenMetadata.decimals
    );

    // allows the offer smart contract to get an amount of tokens from the current user account
    await approveToken(offer.toTokenAddress, this.contractAddress, toRawAmount);

    const tx = await this.contract.buyOffer(offer.id, {
      value: this.takerFee,
    });
    await tx.wait();
  }

  /**
   * Withdraw some ETH from the smart contract.
   * @param amount the amount of ETH to withdraw on the smart contract owner address.
   * (smart contract owner only)
   */
  async withdraw(amount: number) {
    const tx = await this.contract.withdraw(
      ethers.parseEther(amount.toString())
    );
    await tx.wait();
  }
}
