import { Center, CircularProgress } from "@chakra-ui/react";

export interface LoadingProps {}
export const Loading = ({}: LoadingProps): JSX.Element => (
  <Center flexGrow="1">
    <CircularProgress isIndeterminate color="green.300" />
  </Center>
);
