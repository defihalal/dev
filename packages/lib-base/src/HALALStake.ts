import { Decimal, Decimalish } from "./Decimal";

/**
 * Represents the change between two states of an HALAL Stake.
 *
 * @public
 */
export type HALALStakeChange<T> =
  | { stakeHALAL: T; unstakeHALAL?: undefined }
  | { stakeHALAL?: undefined; unstakeHALAL: T; unstakeAllHALAL: boolean };

/** 
 * Represents a user's HALAL stake and accrued gains.
 * 
 * @remarks
 * Returned by the {@link ReadableLiquity.getHALALStake | getHALALStake()} function.

 * @public
 */
export class HALALStake {
  /** The amount of HALAL that's staked. */
  readonly stakedHALAL: Decimal;

  /** Collateral gain available to withdraw. */
  readonly collateralGain: Decimal;

  /** USDH gain available to withdraw. */
  readonly usdhGain: Decimal;

  /** @internal */
  constructor(stakedHALAL = Decimal.ZERO, collateralGain = Decimal.ZERO, usdhGain = Decimal.ZERO) {
    this.stakedHALAL = stakedHALAL;
    this.collateralGain = collateralGain;
    this.usdhGain = usdhGain;
  }

  get isEmpty(): boolean {
    return this.stakedHALAL.isZero && this.collateralGain.isZero && this.usdhGain.isZero;
  }

  /** @internal */
  toString(): string {
    return (
      `{ stakedHALAL: ${this.stakedHALAL}` +
      `, collateralGain: ${this.collateralGain}` +
      `, usdhGain: ${this.usdhGain} }`
    );
  }

  /**
   * Compare to another instance of `HALALStake`.
   */
  equals(that: HALALStake): boolean {
    return (
      this.stakedHALAL.eq(that.stakedHALAL) &&
      this.collateralGain.eq(that.collateralGain) &&
      this.usdhGain.eq(that.usdhGain)
    );
  }

  /**
   * Calculate the difference between this `HALALStake` and `thatStakedHALAL`.
   *
   * @returns An object representing the change, or `undefined` if the staked amounts are equal.
   */
  whatChanged(thatStakedHALAL: Decimalish): HALALStakeChange<Decimal> | undefined {
    thatStakedHALAL = Decimal.from(thatStakedHALAL);

    if (thatStakedHALAL.lt(this.stakedHALAL)) {
      return {
        unstakeHALAL: this.stakedHALAL.sub(thatStakedHALAL),
        unstakeAllHALAL: thatStakedHALAL.isZero
      };
    }

    if (thatStakedHALAL.gt(this.stakedHALAL)) {
      return { stakeHALAL: thatStakedHALAL.sub(this.stakedHALAL) };
    }
  }

  /**
   * Apply a {@link HALALStakeChange} to this `HALALStake`.
   *
   * @returns The new staked HALAL amount.
   */
  apply(change: HALALStakeChange<Decimalish> | undefined): Decimal {
    if (!change) {
      return this.stakedHALAL;
    }

    if (change.unstakeHALAL !== undefined) {
      return change.unstakeAllHALAL || this.stakedHALAL.lte(change.unstakeHALAL)
        ? Decimal.ZERO
        : this.stakedHALAL.sub(change.unstakeHALAL);
    } else {
      return this.stakedHALAL.add(change.stakeHALAL);
    }
  }
}
