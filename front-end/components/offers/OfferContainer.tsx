import { useState } from "react";
import { Flex, useDisclosure } from "@chakra-ui/react";

import { OfferGrid } from "./OfferGrid";
import { OfferList } from "./OfferList";
import { NoOffer } from "./NoOffer";
import { OfferGridControls } from "./OfferGridControls";
import { AddEditOffer } from "@/components/offers";

import { Address, Amount, TokenSymbol } from "@/services/data.types";
import {
  Offer,
  BuyOfferFn,
  CreateOfferFn,
  CancelOfferFn,
  isOfferOwner,
  EditOfferFn,
} from "@/services/offerService";
import { tools } from "@/services/tools";
import { ViewType, ViewTypeKey } from "@/components/ui";

export interface OfferContainerProps {
  offers: Array<Offer>;
  buyOffer: BuyOfferFn;
  createOffer: CreateOfferFn;
  editOffer: EditOfferFn;
  cancelOffer: CancelOfferFn;
  currentUser: Address;
}
export const OfferContainer = ({
  offers,
  buyOffer,
  createOffer,
  editOffer,
  cancelOffer,
  currentUser,
}: OfferContainerProps): JSX.Element => {
  const [viewType, setViewType] = useState<ViewTypeKey>("GridView");

  /**
   * Get the list of tokens used in the different offers.
   */
  const getTokenList = () => {
    const firstTokenSet = new Set(offers.map((o) => o.soldTokenSymbol));
    const secondTokenSet = new Set(offers.map((o) => o.toTokenSymbol));
    return [
      Array.from(firstTokenSet.values()),
      Array.from(secondTokenSet.values()),
    ];
  };

  const [soldTokenSymbols, toTokenSymbols] = getTokenList();
  const [soldTokenSymbolFilter, setSoldTokenSymbolFilter] =
    useState<TokenSymbol>();
  const [soldTokenAmountFilter, setSoldTokenAmountFilter] = useState<Amount>();
  const [toTokenSymbolFilter, settoTokenSymbolFilter] = useState<TokenSymbol>();
  const [toTokenAmountFilter, settoTokenAmountFilter] = useState<Amount>();
  const [ownerOnlyFilter, setOwnerOnlyFilter] = useState<boolean>();
  const [reservedOnlyFilter, setReservedOnlyFilter] = useState<boolean>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>();

  const onFilterSoldTokenAmount = (amount: Amount) =>
    setSoldTokenAmountFilter(amount);
  const onFilterSoldTokenSymbol = (symbol: TokenSymbol) =>
    setSoldTokenSymbolFilter(symbol);
  const onFiltertoTokenAmount = (amount: Amount) =>
    settoTokenAmountFilter(amount);
  const onFiltertoTokenSymbol = (symbol: TokenSymbol) =>
    settoTokenSymbolFilter(symbol);
  const onFilterOwnerOnly = (isOwnerOnly: boolean) =>
    setOwnerOnlyFilter(isOwnerOnly);
  const onFilterReservedOnly = (isReservedOnly: boolean) =>
    setReservedOnlyFilter(isReservedOnly);

  const getFilteredOffers = (): Array<Offer> =>
    offers
      .filter(
        (o) =>
          !soldTokenSymbolFilter || o.soldTokenSymbol === soldTokenSymbolFilter
      )
      .filter(
        (o) =>
          !soldTokenAmountFilter || o.soldTokenAmount >= soldTokenAmountFilter
      )
      .filter(
        (o) => !toTokenSymbolFilter || o.toTokenSymbol === toTokenSymbolFilter
      )
      .filter(
        (o) => !toTokenAmountFilter || o.toTokenAmount >= toTokenAmountFilter
      )
      .filter(
        (o) =>
          !o.reservedFor ||
          tools.isSameAddress(o.reservedFor, currentUser) ||
          isOfferOwner(currentUser, o)
      )
      .filter(
        (o) =>
          (!ownerOnlyFilter && !reservedOnlyFilter) ||
          (ownerOnlyFilter && isOfferOwner(currentUser, o)) ||
          (reservedOnlyFilter &&
            o.reservedFor &&
            tools.isSameAddress(o.reservedFor, currentUser))
      );

  const onAddEditClose = () => {
    setEditingOffer(undefined);
    onClose();
  };

  const onEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    onOpen();
  };

  const onSetView = (newViewType: ViewTypeKey) => {
    setViewType(newViewType);
  };

  return (
    <>
      <Flex direction="column" bgColor="brandBgPrimary">
        <OfferGridControls
          currentUser={currentUser}
          viewType={viewType}
          soldTokenSymbols={soldTokenSymbols}
          toTokenSymbols={toTokenSymbols}
          onFilterSoldTokenAmount={onFilterSoldTokenAmount}
          onFilterSoldTokenSymbol={onFilterSoldTokenSymbol}
          onFiltertoTokenAmount={onFiltertoTokenAmount}
          onFiltertoTokenSymbol={onFiltertoTokenSymbol}
          onFilterOwnerOnly={onFilterOwnerOnly}
          onFilterReservedOnly={onFilterReservedOnly}
          onSetView={onSetView}
          onCreate={onOpen}
        />
        {getFilteredOffers().length > 0 ? (
          <>
            {ViewType[viewType] === ViewType.GridView && (
              <OfferGrid
                currentUser={currentUser}
                offers={getFilteredOffers()}
                buyOffer={buyOffer}
                cancelOffer={cancelOffer}
                onEditOffer={onEditOffer}
              />
            )}
            {ViewType[viewType] === ViewType.ListView && (
              <OfferList
                offers={getFilteredOffers()}
                currentUser={currentUser}
                buyOffer={buyOffer}
                cancelOffer={cancelOffer}
                onEditOffer={onEditOffer}
              />
            )}
          </>
        ) : (
          <NoOffer />
        )}
      </Flex>
      <AddEditOffer
        isOpen={isOpen}
        editingOffer={editingOffer}
        onClose={onAddEditClose}
        createOffer={createOffer}
        editOffer={editOffer}
        currentUser={currentUser}
      />
    </>
  );
};
