import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};
const colors = {
  brandBgHeaderAndFooter: "#111111",
  brandBgPrimary: "#1c2038",
  brandBgSecondary: "#34375e",
  brandBgTernary: "#2b2f49",
  brandColorPrimary: "#d6d6df",
  brandColorSecondary: "#373c5b",
};

const theme = extendTheme({ config, colors });

export default theme;
