<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [SendableLiquity](./lib-base.sendableliquity.md) &gt; [withdrawUSDHFromStabilityPool](./lib-base.sendableliquity.withdrawusdhfromstabilitypool.md)

## SendableLiquity.withdrawUSDHFromStabilityPool() method

Withdraw USDH from Stability Deposit.

<b>Signature:</b>

```typescript
withdrawUSDHFromStabilityPool(amount: Decimalish): Promise<SentLiquityTransaction<S, LiquityReceipt<R, StabilityDepositChangeDetails>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of USDH to withdraw. |

<b>Returns:</b>

Promise&lt;[SentLiquityTransaction](./lib-base.sentliquitytransaction.md)<!-- -->&lt;S, [LiquityReceipt](./lib-base.liquityreceipt.md)<!-- -->&lt;R, [StabilityDepositChangeDetails](./lib-base.stabilitydepositchangedetails.md)<!-- -->&gt;&gt;&gt;

## Remarks

As a side-effect, the transaction will also pay out the Stability Deposit's [collateral gain](./lib-base.stabilitydeposit.collateralgain.md) and [HALAL reward](./lib-base.stabilitydeposit.halalreward.md)<!-- -->.

