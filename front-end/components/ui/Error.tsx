import { VStack, Icon, Text } from "@chakra-ui/react";
import { TbMoodEmpty } from "react-icons/tb";

export interface ErrorProps {
  message?: string;
}

export const Error = ({ message }: ErrorProps): JSX.Element => (
  <VStack bg="brandBgPrimary" color="brandColorPrimary" p={16}>
    <Icon as={TbMoodEmpty} boxSize={24} />
    {message && <Text fontSize="2xl">{message}</Text>}
  </VStack>
);
