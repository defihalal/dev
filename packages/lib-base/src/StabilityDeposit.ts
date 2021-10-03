import { Decimal, Decimalish } from "./Decimal";

/**
 * Represents the change between two Stability Deposit states.
 *
 * @public
 */
export type StabilityDepositChange<T> =
  | { depositUSDH: T; withdrawUSDH?: undefined }
  | { depositUSDH?: undefined; withdrawUSDH: T; withdrawAllUSDH: boolean };

/**
 * A Stability Deposit and its accrued gains.
 *
 * @public
 */
export class StabilityDeposit {
  /** Amount of USDH in the Stability Deposit at the time of the last direct modification. */
  readonly initialUSDH: Decimal;

  /** Amount of USDH left in the Stability Deposit. */
  readonly currentUSDH: Decimal;

  /** Amount of native currency (e.g. Ether) received in exchange for the used-up USDH. */
  readonly collateralGain: Decimal;

  /** Amount of HALAL rewarded since the last modification of the Stability Deposit. */
  readonly halalReward: Decimal;

  /**
   * Address of frontend through which this Stability Deposit was made.
   *
   * @remarks
   * If the Stability Deposit was made through a frontend that doesn't tag deposits, this will be
   * the zero-address.
   */
  readonly frontendTag: string;

  /** @internal */
  constructor(
    initialUSDH: Decimal,
    currentUSDH: Decimal,
    collateralGain: Decimal,
    halalReward: Decimal,
    frontendTag: string
  ) {
    this.initialUSDH = initialUSDH;
    this.currentUSDH = currentUSDH;
    this.collateralGain = collateralGain;
    this.halalReward = halalReward;
    this.frontendTag = frontendTag;

    if (this.currentUSDH.gt(this.initialUSDH)) {
      throw new Error("currentUSDH can't be greater than initialUSDH");
    }
  }

  get isEmpty(): boolean {
    return (
      this.initialUSDH.isZero &&
      this.currentUSDH.isZero &&
      this.collateralGain.isZero &&
      this.halalReward.isZero
    );
  }

  /** @internal */
  toString(): string {
    return (
      `{ initialUSDH: ${this.initialUSDH}` +
      `, currentUSDH: ${this.currentUSDH}` +
      `, collateralGain: ${this.collateralGain}` +
      `, halalReward: ${this.halalReward}` +
      `, frontendTag: "${this.frontendTag}" }`
    );
  }

  /**
   * Compare to another instance of `StabilityDeposit`.
   */
  equals(that: StabilityDeposit): boolean {
    return (
      this.initialUSDH.eq(that.initialUSDH) &&
      this.currentUSDH.eq(that.currentUSDH) &&
      this.collateralGain.eq(that.collateralGain) &&
      this.halalReward.eq(that.halalReward) &&
      this.frontendTag === that.frontendTag
    );
  }

  /**
   * Calculate the difference between the `currentUSDH` in this Stability Deposit and `thatUSDH`.
   *
   * @returns An object representing the change, or `undefined` if the deposited amounts are equal.
   */
  whatChanged(thatUSDH: Decimalish): StabilityDepositChange<Decimal> | undefined {
    thatUSDH = Decimal.from(thatUSDH);

    if (thatUSDH.lt(this.currentUSDH)) {
      return { withdrawUSDH: this.currentUSDH.sub(thatUSDH), withdrawAllUSDH: thatUSDH.isZero };
    }

    if (thatUSDH.gt(this.currentUSDH)) {
      return { depositUSDH: thatUSDH.sub(this.currentUSDH) };
    }
  }

  /**
   * Apply a {@link StabilityDepositChange} to this Stability Deposit.
   *
   * @returns The new deposited USDH amount.
   */
  apply(change: StabilityDepositChange<Decimalish> | undefined): Decimal {
    if (!change) {
      return this.currentUSDH;
    }

    if (change.withdrawUSDH !== undefined) {
      return change.withdrawAllUSDH || this.currentUSDH.lte(change.withdrawUSDH)
        ? Decimal.ZERO
        : this.currentUSDH.sub(change.withdrawUSDH);
    } else {
      return this.currentUSDH.add(change.depositUSDH);
    }
  }
}
