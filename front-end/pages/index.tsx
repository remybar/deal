import { useState, useEffect, useCallback } from "react";
import { Box, useToast } from "@chakra-ui/react";
import useSWR from "swr";

import { PageLayout } from "@/components/ui/PageLayout";
import { OfferContainer } from "@/components/offers";
import { Error, Loading, InProgressOverlay } from "@/components/ui";
import { successFn, failFn, processWeb3Error } from "@/components/tools";

import { useWeb3, ConnectionStatus } from "@/hooks/useWeb3";
import { useOfferService } from "@/hooks/useOfferService";

import { Address } from "@/services/data.types";
import { Offer, OfferService } from "@/services/offerService";

const fetchOffers = async ([_, service]: [string, OfferService]) =>
  await service.getOffers();

export default function Home() {
  const toast = useToast();

  const { currentUser, connectionStatus, selectedChain } = useWeb3();
  const { offerService } = useOfferService();
  const {
    data: offers,
    error,
    mutate,
    isLoading,
  } = useSWR(offerService ? ["offers", offerService] : null, fetchOffers);
  const [showInProgress, setShowInProgress] = useState(false);

  const success = (msg: string) => successFn(toast);
  const fail = (msg: string) => failFn(toast);

  const processError = (error: any) => {
    const msg = processWeb3Error(error);
    if (msg) {
      fail(msg);
    }
  };

  const isInError = () =>
    error ||
    !selectedChain ||
    connectionStatus !== ConnectionStatus.Connected ||
    !offers;

  const getErrorMessage = () => {
    if (connectionStatus !== ConnectionStatus.Connected) {
      return "Please connect a wallet.";
    }
    if (!selectedChain) {
      return "Please select a supported chain.";
    }

    if (error) {
      return "Unexpected error :-(";
    }
  };

  const refreshOffers = useCallback(
    (removedOffers: Array<number> = [], addedOffers: Array<Offer> = []) => {
      switch (connectionStatus) {
        case ConnectionStatus.Disconnected:
          mutate([]);
          break;

        case ConnectionStatus.Connected:
          if (offers) {
            const newOffers = [
              ...offers.filter((o: Offer) => !removedOffers.includes(o.id!)),
              ...addedOffers,
            ];
            mutate(newOffers, {
              optimisticData: newOffers,
            });
          }
          break;

        default:
          break;
      }
    },
    [connectionStatus, mutate, offers]
  );

  const buyOffer = async (offer: Offer): Promise<void> => {
    try {
      setShowInProgress(true);
      await offerService?.buyOffer(offer);
      refreshOffers([offer.id!]);
      success("The offer has been successfully bought !");
    } catch (error: any) {
      processError(error);
    }
    setShowInProgress(false);
  };

  const createOffer = async (
    fromToken: Address,
    fromAmount: number,
    toToken: Address,
    toAmount: number,
    reservedFor?: Address
  ): Promise<void> => {
    try {
      setShowInProgress(true);
      await offerService?.createOffer(
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        reservedFor
      );
      refreshOffers();
      success("The offer has been successfully created !");
    } catch (error: any) {
      processError(error);
    }
    setShowInProgress(false);
  };

  const editOffer = async (
    id: number,
    fromToken: Address,
    fromAmount: number,
    toToken: Address,
    toAmount: number,
    reservedFor?: Address
  ): Promise<void> => {
    try {
      setShowInProgress(true);
      await offerService?.editOffer(
        id,
        fromToken,
        fromAmount,
        toToken,
        toAmount,
        reservedFor
      );
      refreshOffers();
      success("The offer has been successfully edited !");
    } catch (error: any) {
      processError(error);
    }
    setShowInProgress(false);
  };

  const cancelOffer = async (offerId: number): Promise<void> => {
    try {
      setShowInProgress(true);
      await offerService?.cancelOffer(offerId);
      refreshOffers([offerId]);
      success("The offer has been successfully cancelled !");
    } catch (error: any) {
      processError(error);
    }
    setShowInProgress(false);
  };

  const onOfferRemoved = useCallback(
    (offerId: number) => {
      refreshOffers([offerId]);
    },
    [refreshOffers]
  );

  const onOfferCreated = useCallback(
    (offerId: number) => {
      refreshOffers();
    },
    [refreshOffers]
  );

  const configureService = () => {
    if (offerService) {
      offerService.attachListeners(onOfferRemoved, onOfferCreated);
    }
  };

  useEffect(configureService, [
    offerService,
    onOfferCreated,
    onOfferRemoved,
    refreshOffers,
  ]);
  useEffect(refreshOffers, [connectionStatus, refreshOffers]);

  return (
    <>
      <PageLayout>
        {isInError() ? (
          <Error message={getErrorMessage()} />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Box flexGrow="1" bgColor="brandBgPrimary">
            <OfferContainer
              offers={offers!}
              buyOffer={buyOffer}
              createOffer={createOffer}
              editOffer={editOffer}
              cancelOffer={cancelOffer}
              currentUser={currentUser!}
            />
          </Box>
        )}
      </PageLayout>
      {showInProgress && <InProgressOverlay />}
    </>
  );
}
