import React from "react";
import { Flex } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

const selector = ({ remainingLiquidityMiningHALALReward }: LiquityStoreState) => ({
  remainingLiquidityMiningHALALReward
});

export const RemainingHALAL: React.FC = () => {
  const { remainingLiquidityMiningHALALReward } = useLiquitySelector(selector);

  return (
    <Flex sx={{ mr: 2, fontSize: 2, fontWeight: "medium" }}>
      {remainingLiquidityMiningHALALReward.prettify(0)} HALAL remaining
    </Flex>
  );
};
