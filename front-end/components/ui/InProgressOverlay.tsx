import { Box, VStack, CircularProgress, Text } from "@chakra-ui/react";

export interface InProgressOverlayProps {}
export const InProgressOverlay = ({}: InProgressOverlayProps): JSX.Element => (
  <Box
    pos="absolute"
    top="0"
    left="0"
    w="100vw"
    h="100vh"
    zIndex="99999"
    bgColor="gray.800"
    opacity="70%">
    <VStack h="100vh" gap="8" justifyContent="center" alignItems="center">
      <CircularProgress isIndeterminate size="120px" thickness="3" />
      <Text fontSize="xl" color="white">
        Processing...
      </Text>
    </VStack>
  </Box>
);
