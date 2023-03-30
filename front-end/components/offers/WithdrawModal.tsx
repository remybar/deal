import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  ModalFooter,
  Button,
  Text,
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";

export interface WithDrawModalProps {
  currentBalance: number;
  isOpen: boolean;
  onClose(): void;
  onWithdraw(amount: number): void;
}
export const WithDrawModal = ({
  currentBalance,
  isOpen,
  onClose,
  onWithdraw,
}: WithDrawModalProps): JSX.Element => {
  const [currentValue, setCurrentValue] = useState<number | undefined>();

  const onClick = () => {
    onWithdraw(currentValue!);
  };
  const onChange = (_: any, newValue: number) => {
    setCurrentValue(newValue);
  };

  const isAmountValid = () => {
    return currentValue && currentValue <= currentBalance;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Withdraw</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text
            fontStyle="italic"
            pb={6}>{`The current balance is ${currentBalance} ETH.`}</Text>
          <FormControl isInvalid={!isAmountValid()}>
            <FormLabel fontWeight="bold">Amount</FormLabel>
            <NumberInput
              placeholder="amount to withdraw..."
              onChange={onChange}>
              <NumberInputField />
            </NumberInput>
            {!isAmountValid() && (
              <FormErrorMessage>Invalid Amount.</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onClick}
            isDisabled={!isAmountValid()}
            colorScheme="green">
            Withdraw
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
