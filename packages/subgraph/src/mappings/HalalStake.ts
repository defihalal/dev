import { StakeChanged, StakingGainsWithdrawn } from "../../generated/HALALStaking/HALALStaking";

import { updateStake, withdrawStakeGains } from "../entities/HalalStake";

export function handleStakeChanged(event: StakeChanged): void {
  updateStake(event, event.params.staker, event.params.newStake);
}

export function handleStakeGainsWithdrawn(event: StakingGainsWithdrawn): void {
  withdrawStakeGains(event, event.params.staker, event.params.USDHGain, event.params.ETHGain);
}
