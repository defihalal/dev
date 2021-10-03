import { ethereum, Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";

import { HalalStakeChange, HalalStake } from "../../generated/schema";

import { decimalize, DECIMAL_ZERO, BIGINT_ZERO } from "../utils/bignumbers";

import {
  decreaseNumberOfActiveHALALStakes,
  increaseNumberOfActiveHALALStakes,
  increaseTotalNumberOfHALALStakes
} from "./Global";

import { getUser } from "./User";
import { beginChange, initChange, finishChange } from "./Change";
import { updateSystemStateByHalalStakeChange } from "./SystemState";

function startHALALStakeChange(event: ethereum.Event): HalalStakeChange {
  let sequenceNumber = beginChange();
  let stakeChange = new HalalStakeChange(sequenceNumber.toString());
  stakeChange.issuanceGain = DECIMAL_ZERO;
  stakeChange.redemptionGain = DECIMAL_ZERO;
  initChange(stakeChange, event, sequenceNumber);
  return stakeChange;
}

function finishHALALStakeChange(stakeChange: HalalStakeChange): void {
  finishChange(stakeChange);
  stakeChange.save();
}

function getUserStake(address: Address): HalalStake | null {
  let user = getUser(address);

  if (user.stake == null) {
    return null;
  }

  return HalalStake.load(user.stake);
}

function createStake(address: Address): HalalStake {
  let user = getUser(address);
  let stake = new HalalStake(address.toHexString());

  stake.owner = user.id;
  stake.amount = DECIMAL_ZERO;

  user.stake = stake.id;
  user.save();

  return stake;
}

function getOperationType(stake: HalalStake | null, nextStakeAmount: BigDecimal): string {
  let isCreating = stake.amount == DECIMAL_ZERO && nextStakeAmount > DECIMAL_ZERO;
  if (isCreating) {
    return "stakeCreated";
  }

  let isIncreasing = nextStakeAmount > stake.amount;
  if (isIncreasing) {
    return "stakeIncreased";
  }

  let isRemoving = nextStakeAmount == DECIMAL_ZERO;
  if (isRemoving) {
    return "stakeRemoved";
  }

  return "stakeDecreased";
}

export function updateStake(event: ethereum.Event, address: Address, newStake: BigInt): void {
  let stake = getUserStake(address);
  let isUserFirstStake = stake == null;

  if (stake == null) {
    stake = createStake(address);
  }

  let nextStakeAmount = decimalize(newStake);

  let stakeChange = startHALALStakeChange(event);
  stakeChange.stake = stake.id;
  stakeChange.stakeOperation = getOperationType(stake, nextStakeAmount);
  stakeChange.stakedAmountBefore = stake.amount;
  stakeChange.stakedAmountChange = nextStakeAmount.minus(stake.amount);
  stakeChange.stakedAmountAfter = nextStakeAmount;

  stake.amount = nextStakeAmount;

  if (stakeChange.stakeOperation == "stakeCreated") {
    if (isUserFirstStake) {
      increaseTotalNumberOfHALALStakes();
    } else {
      increaseNumberOfActiveHALALStakes();
    }
  } else if (stakeChange.stakeOperation == "stakeRemoved") {
    decreaseNumberOfActiveHALALStakes();
  }

  updateSystemStateByHalalStakeChange(stakeChange);
  finishHALALStakeChange(stakeChange);

  stake.save();
}

export function withdrawStakeGains(
  event: ethereum.Event,
  address: Address,
  USDHGain: BigInt,
  ETHGain: BigInt
): void {
  if (USDHGain == BIGINT_ZERO && ETHGain == BIGINT_ZERO) {
    return;
  }

  let stake = getUserStake(address) || createStake(address);
  let stakeChange: HalalStakeChange = startHALALStakeChange(event);
  stakeChange.stake = stake.id;
  stakeChange.stakeOperation = "gainsWithdrawn";
  stakeChange.issuanceGain = decimalize(USDHGain);
  stakeChange.redemptionGain = decimalize(ETHGain);
  stakeChange.stakedAmountBefore = stake.amount;
  stakeChange.stakedAmountChange = DECIMAL_ZERO;
  stakeChange.stakedAmountAfter = stake.amount;

  updateSystemStateByHalalStakeChange(stakeChange);
  finishHALALStakeChange(stakeChange);

  stake.save();
}
