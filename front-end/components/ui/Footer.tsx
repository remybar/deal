import { Flex, Text } from "@chakra-ui/react";

export const Footer = (): JSX.Element => (
  <Flex justifyContent="center" p={1} bgColor="brandBgHeaderAndFooter" w="100%">
    <Text fontSize="sm" fontWeight="bold" color="brandColorPrimary">
      2023
    </Text>
  </Flex>
);
