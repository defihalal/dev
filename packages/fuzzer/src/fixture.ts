import { Signer } from "@ethersproject/abstract-signer";

import {
  Decimal,
  Decimalish,
  HALALStake,
  StabilityDeposit,
  TransactableLiquity,
  Trove,
  TroveAdjustmentParams
} from "@liquity/lib-base";

import { EthersLiquity as Liquity } from "@liquity/lib-ethers";

import {
  createRandomTrove,
  shortenAddress,
  benford,
  getListOfTroveOwners,
  listDifference,
  getListOfTroves,
  randomCollateralChange,
  randomDebtChange,
  objToString
} from "./utils";

import { GasHistogram } from "./GasHistogram";

type _GasHistogramsFrom<T> = {
  [P in keyof T]: T[P] extends (...args: never[]) => Promise<infer R> ? GasHistogram<R> : never;
};

type GasHistograms = Pick<
  _GasHistogramsFrom<TransactableLiquity>,
  | "openTrove"
  | "adjustTrove"
  | "closeTrove"
  | "redeemUSDH"
  | "depositUSDHInStabilityPool"
  | "withdrawUSDHFromStabilityPool"
  | "stakeHALAL"
  | "unstakeHALAL"
>;

export class Fixture {
  private readonly deployerLiquity: Liquity;
  private readonly funder: Signer;
  private readonly funderLiquity: Liquity;
  private readonly funderAddress: string;
  private readonly frontendAddress: string;
  private readonly gasHistograms: GasHistograms;

  private price: Decimal;

  totalNumberOfLiquidations = 0;

  private constructor(
    deployerLiquity: Liquity,
    funder: Signer,
    funderLiquity: Liquity,
    funderAddress: string,
    frontendAddress: string,
    price: Decimal
  ) {
    this.deployerLiquity = deployerLiquity;
    this.funder = funder;
    this.funderLiquity = funderLiquity;
    this.funderAddress = funderAddress;
    this.frontendAddress = frontendAddress;
    this.price = price;

    this.gasHistograms = {
      openTrove: new GasHistogram(),
      adjustTrove: new GasHistogram(),
      closeTrove: new GasHistogram(),
      redeemUSDH: new GasHistogram(),
      depositUSDHInStabilityPool: new GasHistogram(),
      withdrawUSDHFromStabilityPool: new GasHistogram(),
      stakeHALAL: new GasHistogram(),
      unstakeHALAL: new GasHistogram()
    };
  }

  static async setup(
    deployerLiquity: Liquity,
    funder: Signer,
    funderLiquity: Liquity,
    frontendAddress: string,
    frontendLiquity: Liquity
  ) {
    const funderAddress = await funder.getAddress();
    const price = await deployerLiquity.getPrice();

    await frontendLiquity.registerFrontend(Decimal.from(10).div(11));

    return new Fixture(
      deployerLiquity,
      funder,
      funderLiquity,
      funderAddress,
      frontendAddress,
      price
    );
  }

  private async sendUSDHFromFunder(toAddress: string, amount: Decimalish) {
    amount = Decimal.from(amount);

    const usdhBalance = await this.funderLiquity.getUSDHBalance();

    if (usdhBalance.lt(amount)) {
      const trove = await this.funderLiquity.getTrove();
      const total = await this.funderLiquity.getTotal();
      const fees = await this.funderLiquity.getFees();

      const targetCollateralRatio =
        trove.isEmpty || !total.collateralRatioIsBelowCritical(this.price)
          ? 1.51
          : Decimal.max(trove.collateralRatio(this.price).add(0.00001), 1.11);

      let newTrove = trove.isEmpty ? Trove.create({ depositCollateral: 1 }) : trove;
      newTrove = newTrove.adjust({ borrowUSDH: amount.sub(usdhBalance).mul(2) });
      newTrove = newTrove.setCollateral(newTrove.debt.mulDiv(targetCollateralRatio, this.price));

      if (trove.isEmpty) {
        const params = Trove.recreate(newTrove, fees.borrowingRate());
        console.log(`[funder] openTrove(${objToString(params)})`);
        await this.funderLiquity.openTrove(params);
      } else {
        let newTotal = total.add(newTrove).subtract(trove);

        if (
          !total.collateralRatioIsBelowCritical(this.price) &&
          newTotal.collateralRatioIsBelowCritical(this.price)
        ) {
          newTotal = newTotal.setCollateral(newTotal.debt.mulDiv(1.51, this.price));
          newTrove = trove.add(newTotal).subtract(total);
        }

        const params = trove.adjustTo(newTrove, fees.borrowingRate());
        console.log(`[funder] adjustTrove(${objToString(params)})`);
        await this.funderLiquity.adjustTrove(params);
      }
    }

    await this.funderLiquity.sendUSDH(toAddress, amount);
  }

  async setRandomPrice() {
    this.price = this.price.add(200 * Math.random() + 100).div(2);
    console.log(`[deployer] setPrice(${this.price})`);
    await this.deployerLiquity.setPrice(this.price);

    return this.price;
  }

  async liquidateRandomNumberOfTroves(price: Decimal) {
    const usdhInStabilityPoolBefore = await this.deployerLiquity.getUSDHInStabilityPool();
    console.log(`// Stability Pool balance: ${usdhInStabilityPoolBefore}`);

    const trovesBefore = await getListOfTroves(this.deployerLiquity);

    if (trovesBefore.length === 0) {
      console.log("// No Troves to liquidate");
      return;
    }

    const troveOwnersBefore = trovesBefore.map(([owner]) => owner);
    const [, lastTrove] = trovesBefore[trovesBefore.length - 1];

    if (!lastTrove.collateralRatioIsBelowMinimum(price)) {
      console.log("// No Troves to liquidate");
      return;
    }

    const maximumNumberOfTrovesToLiquidate = Math.floor(50 * Math.random()) + 1;
    console.log(`[deployer] liquidateUpTo(${maximumNumberOfTrovesToLiquidate})`);
    await this.deployerLiquity.liquidateUpTo(maximumNumberOfTrovesToLiquidate);

    const troveOwnersAfter = await getListOfTroveOwners(this.deployerLiquity);
    const liquidatedTroves = listDifference(troveOwnersBefore, troveOwnersAfter);

    if (liquidatedTroves.length > 0) {
      for (const liquidatedTrove of liquidatedTroves) {
        console.log(`// Liquidated ${shortenAddress(liquidatedTrove)}`);
      }
    }

    this.totalNumberOfLiquidations += liquidatedTroves.length;

    const usdhInStabilityPoolAfter = await this.deployerLiquity.getUSDHInStabilityPool();
    console.log(`// Stability Pool balance: ${usdhInStabilityPoolAfter}`);
  }

  async openRandomTrove(userAddress: string, liquity: Liquity) {
    const total = await liquity.getTotal();
    const fees = await liquity.getFees();

    let newTrove: Trove;

    const cannotOpen = (newTrove: Trove) =>
      total.collateralRatioIsBelowCritical(this.price)
        ? newTrove.collateralRatioIsBelowCritical(this.price)
        : newTrove.collateralRatioIsBelowMinimum(this.price) ||
          total.add(newTrove).collateralRatioIsBelowCritical(this.price);

    // do {
    newTrove = createRandomTrove(this.price);
    // } while (cannotOpen(newTrove));

    await this.funder.sendTransaction({
      to: userAddress,
      value: newTrove.collateral.hex
    });

    const params = Trove.recreate(newTrove, fees.borrowingRate());

    if (cannotOpen(newTrove)) {
      console.log(
        `// [${shortenAddress(userAddress)}] openTrove(${objToString(params)}) expected to fail`
      );

      await this.gasHistograms.openTrove.expectFailure(() =>
        liquity.openTrove(params, { gasPrice: 0 })
      );
    } else {
      console.log(`[${shortenAddress(userAddress)}] openTrove(${objToString(params)})`);

      await this.gasHistograms.openTrove.expectSuccess(() =>
        liquity.send.openTrove(params, { gasPrice: 0 })
      );
    }
  }

  async randomlyAdjustTrove(userAddress: string, liquity: Liquity, trove: Trove) {
    const total = await liquity.getTotal();
    const fees = await liquity.getFees();
    const x = Math.random();

    const params: TroveAdjustmentParams<Decimal> =
      x < 0.333
        ? randomCollateralChange(trove)
        : x < 0.666
        ? randomDebtChange(trove)
        : { ...randomCollateralChange(trove), ...randomDebtChange(trove) };

    const cannotAdjust = (trove: Trove, params: TroveAdjustmentParams<Decimal>) => {
      if (params.withdrawCollateral?.gte(trove.collateral) || params.repayUSDH?.gt(trove.netDebt)) {
        return true;
      }

      const adjusted = trove.adjust(params, fees.borrowingRate());

      return (
        (params.withdrawCollateral?.nonZero || params.borrowUSDH?.nonZero) &&
        (adjusted.collateralRatioIsBelowMinimum(this.price) ||
          (total.collateralRatioIsBelowCritical(this.price)
            ? adjusted._nominalCollateralRatio.lt(trove._nominalCollateralRatio)
            : total.add(adjusted).subtract(trove).collateralRatioIsBelowCritical(this.price)))
      );
    };

    if (params.depositCollateral) {
      await this.funder.sendTransaction({
        to: userAddress,
        value: params.depositCollateral.hex
      });
    }

    if (params.repayUSDH) {
      await this.sendUSDHFromFunder(userAddress, params.repayUSDH);
    }

    if (cannotAdjust(trove, params)) {
      console.log(
        `// [${shortenAddress(userAddress)}] adjustTrove(${objToString(params)}) expected to fail`
      );

      await this.gasHistograms.adjustTrove.expectFailure(() =>
        liquity.adjustTrove(params, { gasPrice: 0 })
      );
    } else {
      console.log(`[${shortenAddress(userAddress)}] adjustTrove(${objToString(params)})`);

      await this.gasHistograms.adjustTrove.expectSuccess(() =>
        liquity.send.adjustTrove(params, { gasPrice: 0 })
      );
    }
  }

  async closeTrove(userAddress: string, liquity: Liquity, trove: Trove) {
    const total = await liquity.getTotal();

    if (total.collateralRatioIsBelowCritical(this.price)) {
      // Cannot close Trove during recovery mode
      console.log("// Skipping closeTrove() in recovery mode");
      return;
    }

    await this.sendUSDHFromFunder(userAddress, trove.netDebt);

    console.log(`[${shortenAddress(userAddress)}] closeTrove()`);

    await this.gasHistograms.closeTrove.expectSuccess(() =>
      liquity.send.closeTrove({ gasPrice: 0 })
    );
  }

  async redeemRandomAmount(userAddress: string, liquity: Liquity) {
    const total = await liquity.getTotal();

    if (total.collateralRatioIsBelowMinimum(this.price)) {
      console.log("// Skipping redeemUSDH() when TCR < MCR");
      return;
    }

    const amount = benford(10000);
    await this.sendUSDHFromFunder(userAddress, amount);

    console.log(`[${shortenAddress(userAddress)}] redeemUSDH(${amount})`);

    await this.gasHistograms.redeemUSDH.expectSuccess(() =>
      liquity.send.redeemUSDH(amount, { gasPrice: 0 })
    );
  }

  async depositRandomAmountInStabilityPool(userAddress: string, liquity: Liquity) {
    const amount = benford(20000);

    await this.sendUSDHFromFunder(userAddress, amount);

    console.log(`[${shortenAddress(userAddress)}] depositUSDHInStabilityPool(${amount})`);

    await this.gasHistograms.depositUSDHInStabilityPool.expectSuccess(() =>
      liquity.send.depositUSDHInStabilityPool(amount, this.frontendAddress, {
        gasPrice: 0
      })
    );
  }

  async withdrawRandomAmountFromStabilityPool(
    userAddress: string,
    liquity: Liquity,
    deposit: StabilityDeposit
  ) {
    const [[, lastTrove]] = await liquity.getTroves({
      first: 1,
      sortedBy: "ascendingCollateralRatio"
    });

    const amount = deposit.currentUSDH.mul(1.1 * Math.random()).add(10 * Math.random());

    const cannotWithdraw = (amount: Decimal) =>
      amount.nonZero && lastTrove.collateralRatioIsBelowMinimum(this.price);

    if (cannotWithdraw(amount)) {
      console.log(
        `// [${shortenAddress(userAddress)}] ` +
          `withdrawUSDHFromStabilityPool(${amount}) expected to fail`
      );

      await this.gasHistograms.withdrawUSDHFromStabilityPool.expectFailure(() =>
        liquity.withdrawUSDHFromStabilityPool(amount, { gasPrice: 0 })
      );
    } else {
      console.log(`[${shortenAddress(userAddress)}] withdrawUSDHFromStabilityPool(${amount})`);

      await this.gasHistograms.withdrawUSDHFromStabilityPool.expectSuccess(() =>
        liquity.send.withdrawUSDHFromStabilityPool(amount, { gasPrice: 0 })
      );
    }
  }

  async stakeRandomAmount(userAddress: string, liquity: Liquity) {
    const halalBalance = await this.funderLiquity.getHALALBalance();
    const amount = halalBalance.mul(Math.random() / 2);

    await this.funderLiquity.sendHALAL(userAddress, amount);

    console.log(`[${shortenAddress(userAddress)}] stakeHALAL(${amount})`);

    await this.gasHistograms.stakeHALAL.expectSuccess(() =>
      liquity.send.stakeHALAL(amount, { gasPrice: 0 })
    );
  }

  async unstakeRandomAmount(userAddress: string, liquity: Liquity, stake: HALALStake) {
    const amount = stake.stakedHALAL.mul(1.1 * Math.random()).add(10 * Math.random());

    console.log(`[${shortenAddress(userAddress)}] unstakeHALAL(${amount})`);

    await this.gasHistograms.unstakeHALAL.expectSuccess(() =>
      liquity.send.unstakeHALAL(amount, { gasPrice: 0 })
    );
  }

  async sweepUSDH(liquity: Liquity) {
    const usdhBalance = await liquity.getUSDHBalance();

    if (usdhBalance.nonZero) {
      await liquity.sendUSDH(this.funderAddress, usdhBalance, { gasPrice: 0 });
    }
  }

  async sweepHALAL(liquity: Liquity) {
    const halalBalance = await liquity.getHALALBalance();

    if (halalBalance.nonZero) {
      await liquity.sendHALAL(this.funderAddress, halalBalance, { gasPrice: 0 });
    }
  }

  summarizeGasStats(): string {
    return Object.entries(this.gasHistograms)
      .map(([name, histo]) => {
        const results = histo.getResults();

        return (
          `${name},outOfGas,${histo.outOfGasFailures}\n` +
          `${name},failure,${histo.expectedFailures}\n` +
          results
            .map(([intervalMin, frequency]) => `${name},success,${frequency},${intervalMin}\n`)
            .join("")
        );
      })
      .join("");
  }
}
