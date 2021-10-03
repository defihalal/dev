import React from "react";
import { Flex } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

const selector = ({ remainingStabilityPoolHALALReward }: LiquityStoreState) => ({
  remainingStabilityPoolHALALReward
});

export const RemainingHALAL: React.FC = () => {
  const { remainingStabilityPoolHALALReward } = useLiquitySelector(selector);

  return (
    <Flex sx={{ mr: 2, fontSize: 2, fontWeight: "medium" }}>
      {remainingStabilityPoolHALALReward.prettify(0)} HALAL remaining
    </Flex>
  );
};
