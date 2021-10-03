import React from "react";
import { Card, Heading, Box, Flex } from "theme-ui";
import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { InfoMessage } from "../../../InfoMessage";
import { UnstakeAndClaim } from "../UnstakeAndClaim";
import { RemainingHALAL } from "../RemainingHALAL";
import { StaticRow } from "../../../Trove/Editor";
import { GT, LP } from "../../../../strings";

const selector = ({ liquidityMiningStake, liquidityMiningHALALReward }: LiquityStoreState) => ({
  liquidityMiningStake,
  liquidityMiningHALALReward
});

export const Disabled: React.FC = () => {
  const { liquidityMiningStake, liquidityMiningHALALReward } = useLiquitySelector(selector);
  const hasStake = !liquidityMiningStake.isZero;

  return (
    <Card>
      <Heading>
        Uniswap Liquidity Farm
        <Flex sx={{ justifyContent: "flex-end" }}>
          <RemainingHALAL />
        </Flex>
      </Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title="Liquidity farming period has finished">
          <Flex>There are no more HALAL rewards left to farm</Flex>
        </InfoMessage>
        {hasStake && (
          <>
            <Box sx={{ border: 1, pt: 3, borderRadius: 3 }}>
              <StaticRow
                label="Stake"
                inputId="farm-deposit"
                amount={liquidityMiningStake.prettify(4)}
                unit={LP}
              />
              <StaticRow
                label="Reward"
                inputId="farm-reward"
                amount={liquidityMiningHALALReward.prettify(4)}
                color={liquidityMiningHALALReward.nonZero && "success"}
                unit={GT}
              />
            </Box>
            <UnstakeAndClaim />
          </>
        )}
      </Box>
    </Card>
  );
};
