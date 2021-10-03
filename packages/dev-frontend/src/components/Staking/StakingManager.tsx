import React from "react";
import { Button, Flex } from "theme-ui";

import {
  Decimal,
  Decimalish,
  LiquityStoreState,
  HALALStake,
  HALALStakeChange
} from "@liquity/lib-base";

import { LiquityStoreUpdate, useLiquityReducer, useLiquitySelector } from "@liquity/lib-react";

import { GT, COIN } from "../../strings";

import { useStakingView } from "./context/StakingViewContext";
import { StakingEditor } from "./StakingEditor";
import { StakingManagerAction } from "./StakingManagerAction";
import { ActionDescription, Amount } from "../ActionDescription";
import { ErrorDescription } from "../ErrorDescription";

const init = ({ halalStake }: LiquityStoreState) => ({
  originalStake: halalStake,
  editedHALAL: halalStake.stakedHALAL
});

type StakeManagerState = ReturnType<typeof init>;
type StakeManagerAction =
  | LiquityStoreUpdate
  | { type: "revert" }
  | { type: "setStake"; newValue: Decimalish };

const reduce = (state: StakeManagerState, action: StakeManagerAction): StakeManagerState => {
  // console.log(state);
  // console.log(action);

  const { originalStake, editedHALAL } = state;

  switch (action.type) {
    case "setStake":
      return { ...state, editedHALAL: Decimal.from(action.newValue) };

    case "revert":
      return { ...state, editedHALAL: originalStake.stakedHALAL };

    case "updateStore": {
      const {
        stateChange: { halalStake: updatedStake }
      } = action;

      if (updatedStake) {
        return {
          originalStake: updatedStake,
          editedHALAL: updatedStake.apply(originalStake.whatChanged(editedHALAL))
        };
      }
    }
  }

  return state;
};

const selectHALALBalance = ({ halalBalance }: LiquityStoreState) => halalBalance;

type StakingManagerActionDescriptionProps = {
  originalStake: HALALStake;
  change: HALALStakeChange<Decimal>;
};

const StakingManagerActionDescription: React.FC<StakingManagerActionDescriptionProps> = ({
  originalStake,
  change
}) => {
  const stakeHALAL = change.stakeHALAL?.prettify().concat(" ", GT);
  const unstakeHALAL = change.unstakeHALAL?.prettify().concat(" ", GT);
  const collateralGain = originalStake.collateralGain.nonZero?.prettify(4).concat(" MATIC");
  const usdhGain = originalStake.usdhGain.nonZero?.prettify().concat(" ", COIN);

  if (originalStake.isEmpty && stakeHALAL) {
    return (
      <ActionDescription>
        You are staking <Amount>{stakeHALAL}</Amount>.
      </ActionDescription>
    );
  }

  return (
    <ActionDescription>
      {stakeHALAL && (
        <>
          You are adding <Amount>{stakeHALAL}</Amount> to your stake
        </>
      )}
      {unstakeHALAL && (
        <>
          You are withdrawing <Amount>{unstakeHALAL}</Amount> to your wallet
        </>
      )}
      {(collateralGain || usdhGain) && (
        <>
          {" "}
          and claiming{" "}
          {collateralGain && usdhGain ? (
            <>
              <Amount>{collateralGain}</Amount> and <Amount>{usdhGain}</Amount>
            </>
          ) : (
            <>
              <Amount>{collateralGain ?? usdhGain}</Amount>
            </>
          )}
        </>
      )}
      .
    </ActionDescription>
  );
};

export const StakingManager: React.FC = () => {
  const { dispatch: dispatchStakingViewAction } = useStakingView();
  const [{ originalStake, editedHALAL }, dispatch] = useLiquityReducer(reduce, init);
  const halalBalance = useLiquitySelector(selectHALALBalance);

  const change = originalStake.whatChanged(editedHALAL);
  const [validChange, description] = !change
    ? [undefined, undefined]
    : change.stakeHALAL?.gt(halalBalance)
    ? [
        undefined,
        <ErrorDescription>
          The amount you're trying to stake exceeds your balance by{" "}
          <Amount>
            {change.stakeHALAL.sub(halalBalance).prettify()} {GT}
          </Amount>
          .
        </ErrorDescription>
      ]
    : [change, <StakingManagerActionDescription originalStake={originalStake} change={change} />];

  const makingNewStake = originalStake.isEmpty;

  return (
    <StakingEditor title={"Staking"} {...{ originalStake, editedHALAL, dispatch }}>
      {description ??
        (makingNewStake ? (
          <ActionDescription>Enter the amount of {GT} you'd like to stake.</ActionDescription>
        ) : (
          <ActionDescription>Adjust the {GT} amount to stake or withdraw.</ActionDescription>
        ))}

      <Flex variant="layout.actions">
        <Button
          variant="cancel"
          onClick={() => dispatchStakingViewAction({ type: "cancelAdjusting" })}
        >
          Cancel
        </Button>

        {validChange ? (
          <StakingManagerAction change={validChange}>Confirm</StakingManagerAction>
        ) : (
          <Button disabled>Confirm</Button>
        )}
      </Flex>
    </StakingEditor>
  );
};
