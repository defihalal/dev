import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { Flex, Spinner, Heading, ThemeProvider, Paragraph } from "theme-ui";

import { BatchedWebSocketAugmentedWeb3Provider } from "@liquity/providers";
import { LiquityProvider } from "./hooks/LiquityContext";
import { WalletConnector } from "./components/WalletConnector";
import { TransactionProvider } from "./components/Transaction";
import { Icon } from "./components/Icon";
import { getConfig } from "./config";
import theme from "./theme";

import { DisposableWalletProvider } from "./testUtils/DisposableWalletProvider";
import { LiquityFrontend } from "./LiquityFrontend";

if (window.ethereum) {
  // Silence MetaMask warning in console
  Object.assign(window.ethereum, { autoRefreshOnNetworkChange: false });
}

if (process.env.REACT_APP_DEMO_MODE === "true") {
  const ethereum = new DisposableWalletProvider(
    `http://${window.location.hostname}:8545`,
    process.env.FUNDER_KEY as string
  );

  Object.assign(window, { ethereum });
}

// Start pre-fetching the config
getConfig().then(config => {
  // console.log("Frontend config:");
  // console.log(config);
  Object.assign(window, { config });
});

const EthersWeb3ReactProvider: React.FC = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={provider => new BatchedWebSocketAugmentedWeb3Provider(provider)}>
      {children}
    </Web3ReactProvider>
  );
};

const UnsupportedMainnetFallback: React.FC = () => (
  <Flex
    sx={{
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center"
    }}
  >
    <Heading sx={{ mb: 3 }}>
      <Icon name="exclamation-triangle" /> This app is for testing purposes only.
    </Heading>

    <Paragraph sx={{ mb: 3 }}>
      {/* Please change your network to Ropsten, Rinkeby, Kovan or Görli. */}
    </Paragraph>

    {/* <Paragraph>
      If you'd like to use Liquidity on mainnet, please pick a frontend{" "}
      <Link href={process.env.FRONTEND_URL}>
        here <Icon name="external-link-alt" size="xs" />
      </Link>
      .
    </Paragraph> */}
  </Flex>
);

const App = () => {
  const loader = (
    <Flex sx={{ alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Spinner sx={{ m: 2, color: "text" }} size="32px" />
      <Heading>Loading...</Heading>
    </Flex>
  );

  const unsupportedNetworkFallback = (chainId: number) => (
    <Flex
      sx={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center"
      }}
    >
      <Heading sx={{ mb: 3 }}>
        <Icon name="exclamation-triangle" /> DeFi Halal is deployed to Polygon Matic only for now
      </Heading>
      <br />
      Please switch your Metamask to <b>Polygon Matic</b> and refresh the page
      <br />
      <br />
      <span>
        *** If you don't have Polygon Matic in your Metamask,{" "}
        <a
          href="https://medium.com/stakingbits/setting-up-metamask-for-polygon-matic-network-838058f6d844"
          rel="noreferrer"
          target="_blank"
        >
          this article
        </a>{" "}
        explains how to add it in a few simple steps! ***
      </span>
    </Flex>
  );

  return (
    <EthersWeb3ReactProvider>
      <ThemeProvider theme={theme}>
        <WalletConnector loader={loader}>
          <LiquityProvider
            loader={loader}
            unsupportedNetworkFallback={unsupportedNetworkFallback}
            unsupportedMainnetFallback={<UnsupportedMainnetFallback />}
          >
            <TransactionProvider>
              <LiquityFrontend loader={loader} />
            </TransactionProvider>
          </LiquityProvider>
        </WalletConnector>
      </ThemeProvider>
    </EthersWeb3ReactProvider>
  );
};

export default App;
