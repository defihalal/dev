import Tippy from "@tippyjs/react";
import { Card, Heading, Box, Flex, Button } from "theme-ui";

import { GT } from "../../strings";

import { InfoMessage } from "../InfoMessage";
import { useStakingView } from "./context/StakingViewContext";

export const NoStake: React.FC = () => {
  const { dispatch } = useStakingView();

  return (
    <Card>
      <Heading>Staking</Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title={`You haven't staked ${GT} yet.`}>
          Stake {GT} to earn a share of borrowing and redemption fees. Learn more:&nbsp;
          <Tippy
            interactive={true}
            placement="auto"
            content={
              <Card variant="tooltip">
                <b> How does staking work in DeFi Halal?</b>
                <br />
                <br />
                To start staking all you need to do is deposit your HALAL token to the DeFi Halal
                staking contract. Once done you will start earning a pro rata share of the borrowing
                and redemption fees in USDH and MATIC.
                <br />
                <br />
                <b> How much will my staked HALAL earn? </b>
                <br />
                <br />
                Your HALAL stake will earn a share of the fees equal to your share of the total HALAL
                staked, at the instant the fee occurred.
                <br />
                <br />
                <b> Is there a lock-up period? </b>
                <br />
                <br />
                No, you can withdraw your staked funds at any time.
                <br />
                <br />
                <b> Can I stake USDH? </b>
                <br /> <br /> You can only stake HALAL tokens. USDH can be deposited into the
                Stability Pool instead.
                <br />
                <br />
                <b>
                  {" "}
                  Are staked HALAL tokens used to backstop the system (like Maker) or for governance?{" "}
                </b>
                <br />
                <br />
                No, staked HALAL are not used to backstop the DeFi Halal system and are not used for
                governance as there is no DeFi Halal governance.
              </Card>
            }
            maxWidth="458px"
          >
            <span style={{ color: "#0c8c04", fontWeight: "bold" }}>How does Staking work?</span>
          </Tippy>
        </InfoMessage>

        <Flex variant="layout.actions">
          <Button onClick={() => dispatch({ type: "startAdjusting" })}>Start staking</Button>
        </Flex>
      </Box>
    </Card>
  );
};
