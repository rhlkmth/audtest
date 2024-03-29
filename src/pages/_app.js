import '@/styles/globals.css'
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import NextApp from "next/app";

class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <ChakraProvider>
        <ColorModeScript initialColorMode="light" />
        <Component {...pageProps} />
      </ChakraProvider>
    );
  }
}

export default App;
