<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-ethers](./lib-ethers.md) &gt; [PopulatableEthersLiquity](./lib-ethers.populatableethersliquity.md) &gt; [stakeHALAL](./lib-ethers.populatableethersliquity.stakehalal.md)

## PopulatableEthersLiquity.stakeHALAL() method

Stake HALAL to start earning fee revenue or increase existing stake.

<b>Signature:</b>

```typescript
stakeHALAL(amount: Decimalish, overrides?: EthersTransactionOverrides): Promise<PopulatedEthersLiquityTransaction<void>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of HALAL to add to new or existing stake. |
|  overrides | [EthersTransactionOverrides](./lib-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;[PopulatedEthersLiquityTransaction](./lib-ethers.populatedethersliquitytransaction.md)<!-- -->&lt;void&gt;&gt;

## Remarks

As a side-effect, the transaction will also pay out an existing HALAL stake's [collateral gain](./lib-base.halalstake.collateralgain.md) and [USDH gain](./lib-base.halalstake.usdhgain.md)<!-- -->.

