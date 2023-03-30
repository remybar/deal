import { PropsWithChildren, useState, useEffect } from "react";
import {
  Button,
  Flex,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

import { TokenSelector, TokenAddressField } from "@/components/tokens";

import { Amount, Address, TokenSymbol } from "@/services/data.types";
import { CreateOfferFn, EditOfferFn, Offer } from "@/services/offerService";
import { tools } from "@/services/tools";

interface FormItemProps {
  label: string;
}
const FormItem = ({
  label,
  children,
}: PropsWithChildren<FormItemProps>): JSX.Element => (
  <>
    <GridItem>
      <Flex h="100%" fontWeight="semibold">
        <Text my="auto">{label}</Text>
      </Flex>
    </GridItem>
    <GridItem colSpan={3}>{children}</GridItem>
  </>
);

export interface AddEditOfferProps {
  isOpen: boolean;
  editingOffer?: Offer;
  createOffer: CreateOfferFn;
  editOffer: EditOfferFn;
  onClose(): void;
  currentUser?: Address;
}
export const AddEditOffer = ({
  isOpen,
  editingOffer,
  createOffer,
  editOffer,
  onClose,
  currentUser,
}: AddEditOfferProps): JSX.Element => {
  const fontSize = "xs";
  const isEditMode = editingOffer !== undefined;

  const [soldTokenAddress, setSoldTokenAddress] = useState<Address>();
  const [soldTokenAmount, setSoldTokenAmount] = useState<Amount>();
  const [toTokenAddress, setToTokenAddress] = useState<Address>();
  const [toTokenAmount, setToTokenAmount] = useState<Amount>();
  const [reservedFor, setReservedFor] = useState<Address>("");

  const onSoldTokenToSellChanged = (address: Address, symbol: TokenSymbol) =>
    setSoldTokenAddress(address);
  const onToTokenChanged = (address: Address, symbol: TokenSymbol) =>
    setToTokenAddress(address);
  const onSoldTokenAmountChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSoldTokenAmount(Number.parseFloat(e.target.value));
  const onToTokenAmountChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setToTokenAmount(Number.parseFloat(e.target.value));

  useEffect(() => {
    if (editingOffer) {
      setSoldTokenAddress(editingOffer.soldTokenAddress);
      setSoldTokenAmount(editingOffer.soldTokenAmount);
      setToTokenAddress(editingOffer.toTokenAddress);
      setToTokenAmount(editingOffer.toTokenAmount);
      if (editingOffer?.reservedFor) setReservedFor(editingOffer.reservedFor);
    }
  }, [editingOffer]);

  const reset = () => {
    setSoldTokenAddress(undefined);
    setSoldTokenAmount(undefined);
    setToTokenAddress(undefined);
    setToTokenAmount(undefined);
    setReservedFor("");
  };

  const _onClose = () => {
    reset();
    onClose();
  };

  const isFormDataValid = () =>
    tools.isAddressValid(currentUser) &&
    tools.isAddressValid(soldTokenAddress) &&
    tools.isAmountValid(soldTokenAmount) &&
    tools.isAddressValid(toTokenAddress) &&
    tools.isAmountValid(toTokenAmount) &&
    !tools.isSameAddress(soldTokenAddress!, toTokenAddress!);

  const hasEditingOfferBeenModified = () =>
    editingOffer &&
    (editingOffer.soldTokenAddress !== soldTokenAddress ||
      editingOffer.soldTokenAmount !== soldTokenAmount ||
      editingOffer.toTokenAddress !== toTokenAddress ||
      editingOffer.toTokenAmount !== toTokenAmount ||
      Boolean(editingOffer.reservedFor) !== Boolean(reservedFor));

  const shouldDisableCreateButton = () => !isFormDataValid();
  const shouldDisableEditButton = () =>
    !isFormDataValid() || !hasEditingOfferBeenModified();

  const onCreate = () => {
    if (isFormDataValid()) {
      createOffer(
        soldTokenAddress!,
        soldTokenAmount!,
        toTokenAddress!,
        toTokenAmount!,
        reservedFor
      ).then(() => {
        _onClose();
      });
    }
  };

  const onEdit = () => {
    if (isFormDataValid()) {
      editOffer(
        editingOffer!.id!,
        soldTokenAddress!,
        soldTokenAmount!,
        toTokenAddress!,
        toTokenAmount!,
        reservedFor
      ).then(() => {
        _onClose();
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditMode ? "Edit the offer" : "Create an offer"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns="repeat(4, 1fr)" gap={4} fontSize={fontSize}>
            <FormItem label="Token to sell">
              <TokenSelector
                defaultValue={
                  editingOffer && {
                    address: editingOffer.soldTokenAddress,
                    symbol: editingOffer.soldTokenSymbol,
                  }
                }
                readOnly={isEditMode}
                colorScheme="blue"
                onChange={onSoldTokenToSellChanged}
              />
            </FormItem>
            <FormItem label="Amount to sell">
              <NumberInput
                defaultValue={editingOffer && editingOffer.soldTokenAmount}>
                <NumberInputField
                  fontSize={fontSize}
                  placeholder="enter an amount"
                  onChange={onSoldTokenAmountChanged}
                />
              </NumberInput>
            </FormItem>
            <FormItem label="For Token">
              <TokenSelector
                defaultValue={
                  editingOffer && {
                    address: editingOffer.toTokenAddress,
                    symbol: editingOffer.toTokenSymbol,
                  }
                }
                colorScheme="purple"
                onChange={onToTokenChanged}
              />
            </FormItem>
            <FormItem label="Amount">
              <NumberInput
                defaultValue={editingOffer && editingOffer.toTokenAmount}>
                <NumberInputField
                  fontSize={fontSize}
                  placeholder="enter an amount"
                  onChange={onToTokenAmountChanged}
                />
              </NumberInput>
            </FormItem>
            <FormItem label="Reserved for">
              <TokenAddressField
                placeholder="enter the user address (optional)"
                value={reservedFor}
                onChange={setReservedFor}
              />
            </FormItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={_onClose}>
            Cancel
          </Button>
          <Button
            onClick={isEditMode ? onEdit : onCreate}
            isDisabled={
              isEditMode
                ? shouldDisableEditButton()
                : shouldDisableCreateButton()
            }
            bg="blue.200"
            _hover={{ bg: "blue.400", color: "white" }}>
            {isEditMode ? "Edit" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
