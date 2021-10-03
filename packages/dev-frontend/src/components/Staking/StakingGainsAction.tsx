import { Button } from "theme-ui";

import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { useLiquity } from "../../hooks/LiquityContext";
import { useTransactionFunction } from "../Transaction";

const selectHALALStake = ({ halalStake }: LiquityStoreState) => halalStake;

export const StakingGainsAction: React.FC = () => {
  const { liquity } = useLiquity();
  const { collateralGain, usdhGain } = useLiquitySelector(selectHALALStake);

  const [sendTransaction] = useTransactionFunction(
    "stake",
    liquity.send.withdrawGainsFromStaking.bind(liquity.send)
  );

  return (
    <Button onClick={sendTransaction} disabled={collateralGain.isZero && usdhGain.isZero}>
      Claim gains
    </Button>
  );
};
