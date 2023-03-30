import { Icon, Flex, Heading } from "@chakra-ui/react";
import { FaHandsHelping } from "react-icons/fa";

export const Logo = (): JSX.Element => (
  <Flex alignItems="center" gap={4}>
    <Icon as={FaHandsHelping} boxSize={8} color="white" />
    <Heading color="white" size="lg">
      Deal
    </Heading>
  </Flex>
);
