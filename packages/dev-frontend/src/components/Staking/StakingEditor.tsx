import React, { useState } from "react";
import { Heading, Box, Card, Button } from "theme-ui";

import { Decimal, Decimalish, Difference, LiquityStoreState, HALALStake } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { COIN, GT } from "../../strings";

import { Icon } from "../Icon";
import { EditableRow, StaticRow } from "../Trove/Editor";
import { LoadingOverlay } from "../LoadingOverlay";

import { useStakingView } from "./context/StakingViewContext";

const select = ({ halalBalance, totalStakedHALAL }: LiquityStoreState) => ({
  halalBalance,
  totalStakedHALAL
});

type StakingEditorProps = {
  title: string;
  originalStake: HALALStake;
  editedHALAL: Decimal;
  dispatch: (action: { type: "setStake"; newValue: Decimalish } | { type: "revert" }) => void;
};

export const StakingEditor: React.FC<StakingEditorProps> = ({
  children,
  title,
  originalStake,
  editedHALAL,
  dispatch
}) => {
  const { halalBalance, totalStakedHALAL } = useLiquitySelector(select);
  const { changePending } = useStakingView();
  const editingState = useState<string>();

  const edited = !editedHALAL.eq(originalStake.stakedHALAL);

  const maxAmount = originalStake.stakedHALAL.add(halalBalance);
  const maxedOut = editedHALAL.eq(maxAmount);

  const totalStakedHALALAfterChange = totalStakedHALAL
    .sub(originalStake.stakedHALAL)
    .add(editedHALAL);

  const originalPoolShare = originalStake.stakedHALAL.mulDiv(100, totalStakedHALAL);
  const newPoolShare = editedHALAL.mulDiv(100, totalStakedHALALAfterChange);
  const poolShareChange =
    originalStake.stakedHALAL.nonZero && Difference.between(newPoolShare, originalPoolShare).nonZero;

  return (
    <Card>
      <Heading>
        {title}
        {edited && !changePending && (
          <Button
            variant="titleIcon"
            sx={{ ":enabled:hover": { color: "danger" } }}
            onClick={() => dispatch({ type: "revert" })}
          >
            <Icon name="history" size="lg" />
          </Button>
        )}
      </Heading>

      <Box sx={{ p: [2, 3] }}>
        <EditableRow
          label="Stake"
          inputId="stake-halal"
          amount={editedHALAL.prettify()}
          maxAmount={maxAmount.toString()}
          maxedOut={maxedOut}
          unit={GT}
          {...{ editingState }}
          editedAmount={editedHALAL.toString(2)}
          setEditedAmount={newValue => dispatch({ type: "setStake", newValue })}
        />

        {newPoolShare.infinite ? (
          <StaticRow label="Pool share" inputId="stake-share" amount="N/A" />
        ) : (
          <StaticRow
            label="Pool share"
            inputId="stake-share"
            amount={newPoolShare.prettify(4)}
            pendingAmount={poolShareChange?.prettify(4).concat("%")}
            pendingColor={poolShareChange?.positive ? "success" : "danger"}
            unit="%"
          />
        )}

        {!originalStake.isEmpty && (
          <>
            <StaticRow
              label="Redemption gain"
              inputId="stake-gain-eth"
              amount={originalStake.collateralGain.prettify(4)}
              color={originalStake.collateralGain.nonZero && "success"}
              unit="MATIC"
            />

            <StaticRow
              label="Issuance gain"
              inputId="stake-gain-usdh"
              amount={originalStake.usdhGain.prettify()}
              color={originalStake.usdhGain.nonZero && "success"}
              unit={COIN}
            />
          </>
        )}

        {children}
      </Box>

      {changePending && <LoadingOverlay />}
    </Card>
  );
};
