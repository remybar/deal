import { UseToastOptions, ToastId } from "@chakra-ui/react";

export const successFn =
  (toastFn: (options?: UseToastOptions | undefined) => ToastId) =>
  (msg: string) => {
    toastFn({
      description: msg,
      status: "success",
      position: "top",
      duration: 3000,
      isClosable: true,
    });
  };

export const failFn =
  (toastFn: (options?: UseToastOptions | undefined) => ToastId) =>
  (msg: string) => {
    toastFn({
      description: msg,
      status: "error",
      position: "top",
      duration: 3000,
      isClosable: true,
    });
  };

export const processWeb3Error = (error: any): string => {
  console.log(error);
  switch (error?.info?.error?.code) {
    case 4001:
      break;
    default:
      return error.reason;
  }

  return "";
};
