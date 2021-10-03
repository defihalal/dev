import React, { useEffect, useState } from "react";
import { Card, Paragraph, Text } from "theme-ui";
import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { InfoIcon } from "../InfoIcon";
import { useLiquity } from "../../hooks/LiquityContext";
import { Badge } from "../Badge";
import { fetchHalalPrice } from "./context/fetchHalalPrice";

const selector = ({
  usdhInStabilityPool,
  remainingStabilityPoolHALALReward
}: LiquityStoreState) => ({
  usdhInStabilityPool,
  remainingStabilityPoolHALALReward
});

export const Yield: React.FC = () => {
  const {
    liquity: {
      connection: { addresses }
    }
  } = useLiquity();
  const { usdhInStabilityPool, remainingStabilityPoolHALALReward } = useLiquitySelector(selector);

  const [halalPrice, setHalalPrice] = useState<Decimal | undefined>(undefined);
  const hasZeroValue = remainingStabilityPoolHALALReward.isZero || usdhInStabilityPool.isZero;
  const halalTokenAddress = addresses["halalToken"];

  useEffect(() => {
    (async () => {
      try {
        const { halalPriceUSD } = await fetchHalalPrice(halalTokenAddress);
        setHalalPrice(halalPriceUSD);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [halalTokenAddress]);

  if (hasZeroValue || halalPrice === undefined) return null;

  const yearlyHalvingSchedule = 0.5; // 50% see HALAL distribution schedule for more info
  const remainingHalalOneYear = remainingStabilityPoolHALALReward.mul(yearlyHalvingSchedule);
  const remainingHalalOneYearInUSD = remainingHalalOneYear.mul(halalPrice);
  const aprPercentage = remainingHalalOneYearInUSD.div(usdhInStabilityPool).mul(100);
  const remainingHalalInUSD = remainingStabilityPoolHALALReward.mul(halalPrice);

  if (aprPercentage.isZero) return null;

  return (
    <Badge>
      <Text>HALAL APR {aprPercentage.toString(2)}%</Text>
      <InfoIcon
        tooltip={
          <Card variant="tooltip" sx={{ width: ["220px", "518px"] }}>
            <Paragraph>
              An <Text sx={{ fontWeight: "bold" }}>estimate</Text> of the HALAL return on the USDH
              deposited to the Stability Pool over the next year, not including your MATIC gains from
              liquidations.
            </Paragraph>
            <Paragraph sx={{ fontSize: "12px", fontFamily: "monospace", mt: 2 }}>
              (($HALAL_REWARDS * YEARLY_DISTRIBUTION%) / DEPOSITED_USDH) * 100 ={" "}
              <Text sx={{ fontWeight: "bold" }}> APR</Text>
            </Paragraph>
            <Paragraph sx={{ fontSize: "12px", fontFamily: "monospace" }}>
              ($
              {remainingHalalInUSD.shorten()} * 50% / ${usdhInStabilityPool.shorten()}) * 100 =
              <Text sx={{ fontWeight: "bold" }}> {aprPercentage.toString(2)}%</Text>
            </Paragraph>
          </Card>
        }
      ></InfoIcon>
    </Badge>
  );
};
