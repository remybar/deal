import { useMemo } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "@/themes/theme";

import { Web3ContextProvider } from "@/hooks/useWeb3";
import { OfferServiceContextProvider } from "@/hooks/useOfferService";
import { getSupportedChains } from "@/contracts/contracts";

export default function App({ Component, pageProps }: AppProps) {
  const supportedChains = useMemo(() => getSupportedChains(), []);
  return (
    <ChakraProvider theme={theme}>
      <Web3ContextProvider supportedChains={supportedChains}>
        <OfferServiceContextProvider>
          <Head>
            <link rel="shortcut icon" href="/images/favicon.ico" />
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/images/apple-touch-icon.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/images/favicon-32x32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/images/favicon-16x16.png"
            />
          </Head>
          <Component {...pageProps} />
        </OfferServiceContextProvider>
      </Web3ContextProvider>
    </ChakraProvider>
  );
}
