import { Button } from "theme-ui";

import { Decimal, HALALStakeChange } from "@liquity/lib-base";

import { useLiquity } from "../../hooks/LiquityContext";
import { useTransactionFunction } from "../Transaction";

type StakingActionProps = {
  change: HALALStakeChange<Decimal>;
};

export const StakingManagerAction: React.FC<StakingActionProps> = ({ change, children }) => {
  const { liquity } = useLiquity();

  const [sendTransaction] = useTransactionFunction(
    "stake",
    change.stakeHALAL
      ? liquity.send.stakeHALAL.bind(liquity.send, change.stakeHALAL)
      : liquity.send.unstakeHALAL.bind(liquity.send, change.unstakeHALAL)
  );

  return <Button onClick={sendTransaction}>{children}</Button>;
};
