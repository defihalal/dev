import {
  CollateralGainTransferDetails,
  Decimalish,
  LiquidationDetails,
  RedemptionDetails,
  SendableLiquity,
  StabilityDepositChangeDetails,
  StabilityPoolGainsWithdrawalDetails,
  TroveAdjustmentDetails,
  TroveAdjustmentParams,
  TroveClosureDetails,
  TroveCreationDetails,
  TroveCreationParams
} from "@liquity/lib-base";

import {
  EthersTransactionOverrides,
  EthersTransactionReceipt,
  EthersTransactionResponse
} from "./types";

import {
  BorrowingOperationOptionalParams,
  PopulatableEthersLiquity,
  PopulatedEthersLiquityTransaction,
  SentEthersLiquityTransaction
} from "./PopulatableEthersLiquity";

const sendTransaction = <T>(tx: PopulatedEthersLiquityTransaction<T>) => tx.send();

/**
 * Ethers-based implementation of {@link @liquity/lib-base#SendableLiquity}.
 *
 * @public
 */
export class SendableEthersLiquity
  implements SendableLiquity<EthersTransactionReceipt, EthersTransactionResponse> {
  private _populate: PopulatableEthersLiquity;

  constructor(populatable: PopulatableEthersLiquity) {
    this._populate = populatable;
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.openTrove} */
  async openTrove(
    params: TroveCreationParams<Decimalish>,
    maxBorrowingRateOrOptionalParams?: Decimalish | BorrowingOperationOptionalParams,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<TroveCreationDetails>> {
    return this._populate
      .openTrove(params, maxBorrowingRateOrOptionalParams, overrides)
      .then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.closeTrove} */
  closeTrove(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<TroveClosureDetails>> {
    return this._populate.closeTrove(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.adjustTrove} */
  adjustTrove(
    params: TroveAdjustmentParams<Decimalish>,
    maxBorrowingRateOrOptionalParams?: Decimalish | BorrowingOperationOptionalParams,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<TroveAdjustmentDetails>> {
    return this._populate
      .adjustTrove(params, maxBorrowingRateOrOptionalParams, overrides)
      .then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.depositCollateral} */
  depositCollateral(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<TroveAdjustmentDetails>> {
    return this._populate.depositCollateral(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.withdrawCollateral} */
  withdrawCollateral(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<TroveAdjustmentDetails>> {
    return this._populate.withdrawCollateral(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.borrowUSDH} */
  borrowUSDH(
    amount: Decimalish,
    maxBorrowingRate?: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<TroveAdjustmentDetails>> {
    return this._populate.borrowUSDH(amount, maxBorrowingRate, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.repayUSDH} */
  repayUSDH(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<TroveAdjustmentDetails>> {
    return this._populate.repayUSDH(amount, overrides).then(sendTransaction);
  }

  /** @internal */
  setPrice(
    price: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.setPrice(price, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.liquidate} */
  liquidate(
    address: string | string[],
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<LiquidationDetails>> {
    return this._populate.liquidate(address, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.liquidateUpTo} */
  liquidateUpTo(
    maximumNumberOfTrovesToLiquidate: number,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<LiquidationDetails>> {
    return this._populate
      .liquidateUpTo(maximumNumberOfTrovesToLiquidate, overrides)
      .then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.depositUSDHInStabilityPool} */
  depositUSDHInStabilityPool(
    amount: Decimalish,
    frontendTag?: string,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<StabilityDepositChangeDetails>> {
    return this._populate
      .depositUSDHInStabilityPool(amount, frontendTag, overrides)
      .then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.withdrawUSDHFromStabilityPool} */
  withdrawUSDHFromStabilityPool(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<StabilityDepositChangeDetails>> {
    return this._populate.withdrawUSDHFromStabilityPool(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.withdrawGainsFromStabilityPool} */
  withdrawGainsFromStabilityPool(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<StabilityPoolGainsWithdrawalDetails>> {
    return this._populate.withdrawGainsFromStabilityPool(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.transferCollateralGainToTrove} */
  transferCollateralGainToTrove(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<CollateralGainTransferDetails>> {
    return this._populate.transferCollateralGainToTrove(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.sendUSDH} */
  sendUSDH(
    toAddress: string,
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.sendUSDH(toAddress, amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.sendHALAL} */
  sendHALAL(
    toAddress: string,
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.sendHALAL(toAddress, amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.redeemUSDH} */
  redeemUSDH(
    amount: Decimalish,
    maxRedemptionRate?: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<RedemptionDetails>> {
    return this._populate.redeemUSDH(amount, maxRedemptionRate, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.claimCollateralSurplus} */
  claimCollateralSurplus(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.claimCollateralSurplus(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.stakeHALAL} */
  stakeHALAL(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.stakeHALAL(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.unstakeHALAL} */
  unstakeHALAL(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.unstakeHALAL(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.withdrawGainsFromStaking} */
  withdrawGainsFromStaking(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.withdrawGainsFromStaking(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.registerFrontend} */
  registerFrontend(
    kickbackRate: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.registerFrontend(kickbackRate, overrides).then(sendTransaction);
  }

  /** @internal */
  _mintUniToken(
    amount: Decimalish,
    address?: string,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate._mintUniToken(amount, address, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.approveUniTokens} */
  approveUniTokens(
    allowance?: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.approveUniTokens(allowance, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.stakeUniTokens} */
  stakeUniTokens(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.stakeUniTokens(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.unstakeUniTokens} */
  unstakeUniTokens(
    amount: Decimalish,
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.unstakeUniTokens(amount, overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.withdrawHALALRewardFromLiquidityMining} */
  withdrawHALALRewardFromLiquidityMining(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.withdrawHALALRewardFromLiquidityMining(overrides).then(sendTransaction);
  }

  /** {@inheritDoc @liquity/lib-base#SendableLiquity.exitLiquidityMining} */
  exitLiquidityMining(
    overrides?: EthersTransactionOverrides
  ): Promise<SentEthersLiquityTransaction<void>> {
    return this._populate.exitLiquidityMining(overrides).then(sendTransaction);
  }
}
