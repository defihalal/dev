import React from "react";
import { Box, Card, Container, Link, Paragraph } from "theme-ui";
import { SystemStats } from "../components/SystemStats";
import { Redemption } from "../components/Redemption/Redemption";
import { InfoMessage } from "../components/InfoMessage";
import { useLiquity } from "../hooks/LiquityContext";
import { Icon } from "../components/Icon";

const uniLink = (usdhAddress: string) =>
  // `https://app.uniswap.org/#/swap?inputCurrency=${usdhAddress}&outputCurrency=MATIC`;
  `https://quickswap.exchange/#/swap?inputCurrency=${usdhAddress}&outputCurrency=MATIC`;

export const RedemptionPage: React.FC = () => {
  const {
    liquity: {
      connection: { addresses }
    }
  } = useLiquity();

  return (
    <Container variant="columns">
      <Container variant="left">
        <Card>
          <Box sx={{ p: [2, 3] }}>
            <InfoMessage title="Bot functionality">
              <Paragraph>
                Redemptions are expected to be carried out by bots when arbitrage opportunities
                emerge.
              </Paragraph>
              <Paragraph sx={{ mt: 2 }}>
                Most of the time you will get a better rate for converting USDH to MATIC on{" "}
                <Link href={uniLink(addresses["usdhToken"])} target="_blank">
                  Quickswap <Icon name="external-link-alt" size="xs" />
                </Link>{" "}
                or other exchanges.
              </Paragraph>
              <Paragraph sx={{ mt: 2 }}>
                <strong>Note</strong>: Redemption is not for repaying your loan. To repay your loan,
                adjust your Trove on the <Link href="#/">Dashboard</Link>.
              </Paragraph>
            </InfoMessage>
          </Box>
        </Card>
        <Redemption />
      </Container>

      <Container variant="right">
        <SystemStats />
      </Container>
    </Container>
  );
};
