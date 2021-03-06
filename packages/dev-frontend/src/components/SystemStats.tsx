import React from "react";
import { Card, Heading, Link, Box, Text } from "theme-ui";
import { AddressZero } from "@ethersproject/constants";
import { Decimal, Percent, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { useLiquity } from "../hooks/LiquityContext";
import { COIN, GT } from "../strings";
import { Statistic } from "./Statistic";
import { PriceManagerForStats } from "./PriceManagerForStats";

const selectBalances = ({ accountBalance, usdhBalance, halalBalance }: LiquityStoreState) => ({
  accountBalance,
  usdhBalance,
  halalBalance
});

const Balances: React.FC = () => {
  const { accountBalance, usdhBalance, halalBalance } = useLiquitySelector(selectBalances);

  return (
    <Box sx={{ mb: 3 }}>
      <Heading>My Account Balances</Heading>
      <Statistic name="MATIC"> {accountBalance.prettify(4)}</Statistic>
      <Statistic name={COIN}> {usdhBalance.prettify()}</Statistic>
      <Statistic name={GT}>{halalBalance.prettify()}</Statistic>
    </Box>
  );
};

const GitHubCommit: React.FC<{ children?: string }> = ({ children }) =>
  children?.match(/[0-9a-f]{40}/) ? (
    <Link href={`https://github.com/defihalal/dev/commit/${children}`}>{children.substr(0, 7)}</Link>
  ) : (
    <>unknown</>
  );

type SystemStatsProps = {
  variant?: string;
  showBalances?: boolean;
};

const select = ({
  numberOfTroves,
  price,
  total,
  usdhInStabilityPool,
  remainingStabilityPoolHALALReward,
  borrowingRate,
  redemptionRate,
  totalStakedHALAL,
  frontend
}: LiquityStoreState) => ({
  numberOfTroves,
  price,
  total,
  usdhInStabilityPool,
  remainingStabilityPoolHALALReward,

  borrowingRate,
  redemptionRate,
  totalStakedHALAL,
  kickbackRate: frontend.status === "registered" ? frontend.kickbackRate : null
});

export const SystemStats: React.FC<SystemStatsProps> = ({ variant = "info", showBalances }) => {
  const {
    liquity: {
      connection: { version: contractsVersion, deploymentDate, frontendTag }
    }
  } = useLiquity();

  const {
    numberOfTroves,
    price,
    usdhInStabilityPool,
    remainingStabilityPoolHALALReward,

    total,
    borrowingRate,
    totalStakedHALAL,
    kickbackRate
  } = useLiquitySelector(select);

  const usdhInStabilityPoolPct =
    total.debt.nonZero && new Percent(usdhInStabilityPool.div(total.debt));
  const totalCollateralRatioPct = new Percent(total.collateralRatio(price));
  const borrowingFeePct = new Percent(borrowingRate);
  const kickbackRatePct = frontendTag === AddressZero ? "100" : kickbackRate?.mul(100).prettify();

  return (
    <Card {...{ variant }}>
      {showBalances && <Balances />}

      <Heading>DeFi Halal statistics</Heading>
      <PriceManagerForStats />
      <Heading as="h2" sx={{ mt: 3, fontWeight: "body" }}>
        Protocol
      </Heading>

      <Statistic
        name="Borrowing Fee"
        tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount (in USDH) and is part of a Trove's debt. The fee varies between 0.5% and 5% depending on USDH redemption volumes."
      >
        {borrowingFeePct.toString(2)}
      </Statistic>

      <Statistic
        name="TVL"
        tooltip="The Total Value Locked (TVL) is the total value of Ether locked as collateral in the system, given in MATIC and USD."
      >
        {total.collateral.shorten()} <Text sx={{ fontSize: 1 }}>&nbsp;MATIC</Text>
        <Text sx={{ fontSize: 1 }}>
          &nbsp;(${Decimal.from(total.collateral.mul(price)).shorten()})
        </Text>
      </Statistic>
      <Statistic name="Troves" tooltip="The total number of active Troves in the system.">
        {Decimal.from(numberOfTroves).prettify(0)}
      </Statistic>
      <Statistic name="USDH supply" tooltip="The total USDH minted by the Liquity Protocol.">
        {total.debt.shorten()}
      </Statistic>
      {usdhInStabilityPoolPct && (
        <Statistic
          name="USDH in Stability Pool"
          tooltip="The total USDH currently held in the Stability Pool, expressed as an amount and a fraction of the USDH supply.
        "
        >
          {usdhInStabilityPool.shorten()}
          <Text sx={{ fontSize: 1 }}>&nbsp;({usdhInStabilityPoolPct.toString(1)})</Text>
        </Statistic>
      )}
      <Statistic
        name="Staked HALAL"
        tooltip="The total amount of HALAL that is staked for earning fee revenue."
      >
        {totalStakedHALAL.shorten()}
      </Statistic>
      <Statistic
        name="Total Collateral Ratio"
        tooltip="The ratio of the Dollar value of the entire system collateral at the current MATIC:USD price, to the entire system debt."
      >
        {totalCollateralRatioPct.prettify()}
      </Statistic>
      <Statistic
        name="Recovery Mode"
        tooltip="Recovery Mode is activated when the Total Collateral Ratio (TCR) falls below 150%. When active, your Trove can be liquidated if its collateral ratio is below the TCR. The maximum collateral you can lose from liquidation is capped at 110% of your Trove's debt. Operations are also restricted that would negatively impact the TCR."
      >
        {total.collateralRatioIsBelowCritical(price) ? <Box color="danger">Yes</Box> : "No"}
      </Statistic>

      {kickbackRatePct && (
        <Statistic
          name="Kickback Rate"
          tooltip="A rate between 0 and 100% set by the Frontend Operator that determines the fraction of HALAL that will be paid out as a kickback to the Stability Providers using the frontend."
        >
          {kickbackRatePct}%
        </Statistic>
      )}

      {/* <Statistic
        name="HALAL Profit Rate"
        tooltip={
          <>
            <span>
              An estimate of the HALAL profit return on the USDH deposited to the Stability Pool over
              the next year, not including your MATIC gains from liquidations. (($HALAL_REWARDS *
              YEARLY_DISTRIBUTION%) / DEPOSITED_USDH) * 100 = APR $
              {remainingStabilityPoolHALALReward.shorten()}* 50% / ${usdhInStabilityPool.shorten()})
              * 100 ={" "}
              {remainingStabilityPoolHALALReward
                .mul(0.5)
                .div(usdhInStabilityPool)
                .mul(100)
                .shorten()}
              %
            </span>
          </>
        }
      >
        {remainingStabilityPoolHALALReward.mul(0.5).div(usdhInStabilityPool).mul(100).shorten()}%
      </Statistic> */}

      <Box sx={{ mt: 3, opacity: 0.66 }}>
        <Box sx={{ fontSize: 0 }}>
          Contracts version: <GitHubCommit>{contractsVersion}</GitHubCommit>
        </Box>
        <Box sx={{ fontSize: 0 }}>Deployed: {deploymentDate.toLocaleString()}</Box>
        <Box sx={{ fontSize: 0 }}>
          Frontend version:{" "}
          {process.env.NODE_ENV === "development" ? (
            "development"
          ) : (
            <GitHubCommit>{process.env.REACT_APP_VERSION}</GitHubCommit>
          )}
        </Box>
      </Box>
    </Card>
  );
};
