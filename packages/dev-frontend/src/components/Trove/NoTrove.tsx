import Tippy from "@tippyjs/react";
import React, { useCallback } from "react";
import { Card, Heading, Box, Flex, Button } from "theme-ui";
import { InfoMessage } from "../InfoMessage";
import { useTroveView } from "./context/TroveViewContext";

export const NoTrove: React.FC = props => {
  const { dispatchEvent } = useTroveView();

  const handleOpenTrove = useCallback(() => {
    dispatchEvent("OPEN_TROVE_PRESSED");
  }, [dispatchEvent]);

  return (
    <Card>
      <Heading>Trove</Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title="You haven't borrowed any USDH yet.">
          You can borrow USDH by opening a Trove. Learn more:&nbsp;
          <Tippy
            interactive={true}
            placement="auto"
            content={
              <Card variant="tooltip">
                <b> What is a Trove?</b>
                <br />
                <br />A Trove is where you take out and maintain your loan. Each Trove is linked to a
                Polygon address and each address can have just one Trove. If you are familiar with
                Vaults or CDPs from other platforms, Troves are similar in concept. <br />
                <br />
                Troves maintain two balances: one is an asset (MATIC) acting as collateral and the
                other is a debt denominated in USDH. You can change the amount of each by adding
                collateral or repaying debt. As you make these balance changes, your Trove’s
                collateral ratio changes accordingly. <br />
                <br />
                You can close your Trove at any time by fully paying off your debt.
              </Card>
            }
            maxWidth="458px"
          >
            <span style={{ color: "#0c8c04", fontWeight: "bold" }}>What is a Trove?</span>
          </Tippy>
        </InfoMessage>

        <Flex variant="layout.actions">
          <Button onClick={handleOpenTrove}>Open Trove</Button>
        </Flex>
      </Box>
    </Card>
  );
};
