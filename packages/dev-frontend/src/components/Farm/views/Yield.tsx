import React, { useEffect, useState } from "react";
import { Card, Paragraph, Text } from "theme-ui";
import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { InfoIcon } from "../../InfoIcon";
import { useLiquity } from "../../../hooks/LiquityContext";
import { Badge } from "../../Badge";
import { fetchPrices } from "../context/fetchPrices";

const selector = ({
  remainingLiquidityMiningHALALReward,
  totalStakedUniTokens
}: LiquityStoreState) => ({
  remainingLiquidityMiningHALALReward,
  totalStakedUniTokens
});

export const Yield: React.FC = () => {
  const {
    liquity: {
      connection: { addresses, liquidityMiningHALALRewardRate }
    }
  } = useLiquity();

  const { remainingLiquidityMiningHALALReward, totalStakedUniTokens } = useLiquitySelector(selector);
  const [halalPrice, setHalalPrice] = useState<Decimal | undefined>(undefined);
  const [uniLpPrice, setUniLpPrice] = useState<Decimal | undefined>(undefined);
  const hasZeroValue = remainingLiquidityMiningHALALReward.isZero || totalStakedUniTokens.isZero;
  const halalTokenAddress = addresses["halalToken"];
  const uniTokenAddress = addresses["uniToken"];
  const secondsRemaining = remainingLiquidityMiningHALALReward.div(liquidityMiningHALALRewardRate);
  const daysRemaining = secondsRemaining.div(60 * 60 * 24);

  useEffect(() => {
    (async () => {
      try {
        const { halalPriceUSD, uniLpPriceUSD } = await fetchPrices(
          halalTokenAddress,
          uniTokenAddress
        );
        setHalalPrice(halalPriceUSD);
        setUniLpPrice(uniLpPriceUSD);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [halalTokenAddress, uniTokenAddress]);

  if (hasZeroValue || halalPrice === undefined || uniLpPrice === undefined) return null;

  const remainingHalalInUSD = remainingLiquidityMiningHALALReward.mul(halalPrice);
  const totalStakedUniLpInUSD = totalStakedUniTokens.mul(uniLpPrice);
  const yieldPercentage = remainingHalalInUSD.div(totalStakedUniLpInUSD).mul(100);

  if (yieldPercentage.isZero) return null;

  return (
    <Badge>
      <Text>
        {daysRemaining?.prettify(0)} day yield {yieldPercentage.toString(2)}%
      </Text>
      <InfoIcon
        tooltip={
          <Card variant="tooltip" sx={{ minWidth: ["auto", "352px"] }}>
            <Paragraph>
              An <Text sx={{ fontWeight: "bold" }}>estimate</Text> of the HALAL return on staked UNI
              LP tokens. The farm runs for 6-weeks, and the return is relative to the time remaining.
            </Paragraph>
            <Paragraph sx={{ fontSize: "12px", fontFamily: "monospace", mt: 2 }}>
              ($HALAL_REWARDS / $STAKED_UNI_LP) * 100 ={" "}
              <Text sx={{ fontWeight: "bold" }}> Yield</Text>
            </Paragraph>
            <Paragraph sx={{ fontSize: "12px", fontFamily: "monospace" }}>
              ($
              {remainingHalalInUSD.shorten()} / ${totalStakedUniLpInUSD.shorten()}) * 100 =
              <Text sx={{ fontWeight: "bold" }}> {yieldPercentage.toString(2)}%</Text>
            </Paragraph>
          </Card>
        }
      ></InfoIcon>
    </Badge>
  );
};
