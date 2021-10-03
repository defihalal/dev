<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [StabilityPoolGainsWithdrawalDetails](./lib-base.stabilitypoolgainswithdrawaldetails.md)

## StabilityPoolGainsWithdrawalDetails interface

Details of a [withdrawGainsFromStabilityPool()](./lib-base.transactableliquity.withdrawgainsfromstabilitypool.md) transaction.

<b>Signature:</b>

```typescript
export interface StabilityPoolGainsWithdrawalDetails 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [collateralGain](./lib-base.stabilitypoolgainswithdrawaldetails.collateralgain.md) | [Decimal](./lib-base.decimal.md) | Amount of native currency (e.g. Ether) paid out to the depositor in this transaction. |
|  [halalReward](./lib-base.stabilitypoolgainswithdrawaldetails.halalreward.md) | [Decimal](./lib-base.decimal.md) | Amount of HALAL rewarded to the depositor in this transaction. |
|  [newUSDHDeposit](./lib-base.stabilitypoolgainswithdrawaldetails.newusdhdeposit.md) | [Decimal](./lib-base.decimal.md) | Amount of USDH in the deposit directly after this transaction. |
|  [usdhLoss](./lib-base.stabilitypoolgainswithdrawaldetails.usdhloss.md) | [Decimal](./lib-base.decimal.md) | Amount of USDH burned from the deposit by liquidations since the last modification. |
