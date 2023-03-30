import React from "react";
import { PropsWithChildren } from "react";
import { Flex } from "@chakra-ui/react";

import { Header } from "./Header";
import { Footer } from "./Footer";

export interface PageLayoutProps {}

export const PageLayout = ({
  children,
  ...rest
}: PropsWithChildren<PageLayoutProps>): JSX.Element => {
  return (
    <Flex
      direction="column"
      minH="100vh"
      justifyContent="space-between"
      bgColor="brandBgPrimary"
      {...rest}>
      <Header />
      {children}
      <Footer />
    </Flex>
  );
};
