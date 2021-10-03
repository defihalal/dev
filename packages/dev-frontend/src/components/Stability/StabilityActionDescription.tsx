import React from "react";

import { Decimal, StabilityDeposit, StabilityDepositChange } from "@liquity/lib-base";

import { COIN, GT } from "../../strings";
import { ActionDescription, Amount } from "../ActionDescription";

type StabilityActionDescriptionProps = {
  originalDeposit: StabilityDeposit;
  change: StabilityDepositChange<Decimal>;
};

export const StabilityActionDescription: React.FC<StabilityActionDescriptionProps> = ({
  originalDeposit,
  change
}) => {
  const collateralGain = originalDeposit.collateralGain.nonZero?.prettify(4).concat(" MATIC");
  const halalReward = originalDeposit.halalReward.nonZero?.prettify().concat(" ", GT);

  return (
    <ActionDescription>
      {change.depositUSDH ? (
        <>
          You are depositing{" "}
          <Amount>
            {change.depositUSDH.prettify()} {COIN}
          </Amount>{" "}
          in the Stability Pool
        </>
      ) : (
        <>
          You are withdrawing{" "}
          <Amount>
            {change.withdrawUSDH.prettify()} {COIN}
          </Amount>{" "}
          to your wallet
        </>
      )}
      {(collateralGain || halalReward) && (
        <>
          {" "}
          and claiming at least{" "}
          {collateralGain && halalReward ? (
            <>
              <Amount>{collateralGain}</Amount> and <Amount>{halalReward}</Amount>
            </>
          ) : (
            <Amount>{collateralGain ?? halalReward}</Amount>
          )}
        </>
      )}
      .
    </ActionDescription>
  );
};
