import { Heading, Box, Card, Flex, Button } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { COIN, GT } from "../../strings";

import { DisabledEditableRow, StaticRow } from "../Trove/Editor";
import { LoadingOverlay } from "../LoadingOverlay";
import { Icon } from "../Icon";

import { useStakingView } from "./context/StakingViewContext";
import { StakingGainsAction } from "./StakingGainsAction";

const select = ({ halalStake, totalStakedHALAL }: LiquityStoreState) => ({
  halalStake,
  totalStakedHALAL
});

export const ReadOnlyStake: React.FC = () => {
  const { changePending, dispatch } = useStakingView();
  const { halalStake, totalStakedHALAL } = useLiquitySelector(select);

  const poolShare = halalStake.stakedHALAL.mulDiv(100, totalStakedHALAL);

  return (
    <Card>
      <Heading>Staking</Heading>

      <Box sx={{ p: [2, 3] }}>
        <DisabledEditableRow
          label="Stake"
          inputId="stake-halal"
          amount={halalStake.stakedHALAL.prettify()}
          unit={GT}
        />

        <StaticRow
          label="Pool share"
          inputId="stake-share"
          amount={poolShare.prettify(4)}
          unit="%"
        />

        <StaticRow
          label="Redemption gain"
          inputId="stake-gain-eth"
          amount={halalStake.collateralGain.prettify(4)}
          color={halalStake.collateralGain.nonZero && "success"}
          unit="MATIC"
        />

        <StaticRow
          label="Issuance gain"
          inputId="stake-gain-usdh"
          amount={halalStake.usdhGain.prettify()}
          color={halalStake.usdhGain.nonZero && "success"}
          unit={COIN}
        />

        <Flex variant="layout.actions">
          <Button variant="outline" onClick={() => dispatch({ type: "startAdjusting" })}>
            <Icon name="pen" size="sm" />
            &nbsp;Adjust
          </Button>

          <StakingGainsAction />
        </Flex>
      </Box>

      {changePending && <LoadingOverlay />}
    </Card>
  );
};
