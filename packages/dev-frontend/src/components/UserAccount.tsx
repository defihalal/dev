import React from "react";
import { Text, Flex, Box, Heading } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { COIN, GT } from "../strings";
import { useLiquity } from "../hooks/LiquityContext";
import { shortenAddress } from "../utils/shortenAddress";

import { Icon } from "./Icon";

const select = ({ accountBalance, usdhBalance, halalBalance }: LiquityStoreState) => ({
  accountBalance,
  usdhBalance,
  halalBalance
});

export const UserAccount: React.FC = () => {
  const { account, liquity } = useLiquity();
  const { accountBalance, usdhBalance, halalBalance } = useLiquitySelector(select);
  const networkName =
    liquity.connection.chainId === 137
      ? "Polygon Matic Mainnet"
      : liquity.connection.chainId === 80001
      ? "Polygon Mumbai Testnet"
      : "";

  return (
    <Box sx={{ display: ["none", "flex"] }}>
      <Flex sx={{ alignItems: "center" }}>
        <Icon name="user-circle" size="lg" />
        <Flex sx={{ ml: 3, mr: 4, flexDirection: "column" }}>
          <Heading sx={{ fontSize: 1 }}>Connected as</Heading>
          <Text as="span" sx={{ fontSize: 1 }}>
            {shortenAddress(account)}
          </Text>
          <Text sx={{ fontSize: 1 }}>{networkName}</Text>
        </Flex>
      </Flex>

      <Flex sx={{ alignItems: "center" }}>
        <Icon name="wallet" size="lg" />

        {([
          ["MATIC", accountBalance],
          [COIN, usdhBalance],
          [GT, halalBalance]
        ] as const).map(([currency, balance], i) => (
          <Flex key={i} sx={{ ml: 3, flexDirection: "column" }}>
            <Heading sx={{ fontSize: 1 }}>{currency}</Heading>
            <Text sx={{ fontSize: 1 }}>{balance.prettify()}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};
