import Tippy from "@tippyjs/react";
import React, { useCallback } from "react";
import { Card, Heading, Box, Flex, Button } from "theme-ui";
import { InfoMessage } from "../InfoMessage";
import { useStabilityView } from "./context/StabilityViewContext";
import { RemainingHALAL } from "./RemainingHALAL";
import { Yield } from "./Yield";

export const NoDeposit: React.FC = props => {
  const { dispatchEvent } = useStabilityView();

  const handleOpenTrove = useCallback(() => {
    dispatchEvent("DEPOSIT_PRESSED");
  }, [dispatchEvent]);

  return (
    <Card>
      <Heading>
        Stability Pool
        <Flex sx={{ justifyContent: "flex-end" }}>
          <RemainingHALAL />
        </Flex>
      </Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title="You have no USDH in the Stability Pool.">
          You can earn MATIC and HALAL rewards by depositing USDH. Learn more:&nbsp;
          <Tippy
            interactive={true}
            placement="auto"
            content={
              <Card variant="tooltip">
                <b>What is the Stability Pool?</b>
                <br />
                <br />
                The Stability Pool is the first line of defense in maintaining system solvency. It
                achieves that by acting as the source of liquidity to repay debt from liquidated
                Troves—ensuring that the total USDH supply always remains backed.
                <br />
                <br />
                When any Trove is liquidated, an amount of USDH corresponding to the remaining debt
                of the Trove is burned from the Stability Pool’s balance to repay its debt. In
                exchange, the entire collateral from the Trove is transferred to the Stability Pool.
                <br />
                <br />
                The Stability Pool is funded by users transferring USDH into it (called Stability
                Providers). Over time Stability Providers lose a pro-rata share of their USDH
                deposits, while gaining a pro-rata share of the liquidated collateral. However,
                because Troves are likely to be liquidated at just below 110% collateral ratios, it
                is expected that Stability Providers will receive a greater dollar-value of
                collateral relative to the debt they pay off.
              </Card>
            }
            maxWidth="458px"
          >
            <span style={{ color: "#0c8c04", fontWeight: "bold" }}>What is the Stability Pool?</span>
          </Tippy>
        </InfoMessage>

        <Flex variant="layout.actions">
          <Flex sx={{ justifyContent: "flex-start", flex: 1, alignItems: "center" }}>
            <Yield />
          </Flex>
          <Button onClick={handleOpenTrove}>Deposit</Button>
        </Flex>
      </Box>
    </Card>
  );
};
