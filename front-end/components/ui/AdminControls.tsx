import { useState } from "react";
import { Button, useDisclosure, useToast } from "@chakra-ui/react";

import { successFn, failFn, processWeb3Error } from "@/components/tools";
import { WithDrawModal } from "@/components/offers/WithdrawModal";

import { useOfferService } from "@/hooks/useOfferService";
import { useWeb3 } from "@/hooks/useWeb3";

export interface AdminControlsProps {}
export const AdminControls = ({}: AdminControlsProps): JSX.Element => {
  const toast = useToast();
  const { offerService } = useOfferService();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentBalance, setCurrentBalance] = useState<number>(0);

  const success = successFn(toast);
  const fail = failFn(toast);

  const onWithdraw = async (amount: number) => {
    try {
      await offerService?.withdraw(amount);
      success("Withdraw successfully done !");
    } catch (error: any) {
      const msg = processWeb3Error(error);
      if (msg) fail(msg);
    }
    onClose();
  };

  const onClick = async () => {
    const balance = (await offerService?.getCurrentBalance()) || 0;
    setCurrentBalance(balance);
    onOpen();
  };

  return (
    <>
      <Button
        px={8}
        colorScheme="yellow"
        _hover={{ bg: "yellow.600", color: "yellow.50" }}
        variant="ghost"
        onClick={onClick}>
        Withdraw
      </Button>
      <WithDrawModal
        currentBalance={currentBalance}
        isOpen={isOpen}
        onClose={onClose}
        onWithdraw={onWithdraw}
      />
    </>
  );
};
