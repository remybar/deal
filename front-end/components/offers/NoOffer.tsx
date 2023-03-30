import { VStack, Icon, Text } from "@chakra-ui/react";
import { GiShrug } from "react-icons/gi";

export const NoOffer = (): JSX.Element => (
  <VStack bg="brandBgPrimary" color="brandColorPrimary" p={16}>
    <Icon as={GiShrug} boxSize={24} />
    <Text fontSize="2xl">There are no offers matching your criteria...</Text>
  </VStack>
);
