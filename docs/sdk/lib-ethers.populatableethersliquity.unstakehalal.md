<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-ethers](./lib-ethers.md) &gt; [PopulatableEthersLiquity](./lib-ethers.populatableethersliquity.md) &gt; [unstakeHALAL](./lib-ethers.populatableethersliquity.unstakehalal.md)

## PopulatableEthersLiquity.unstakeHALAL() method

Withdraw HALAL from staking.

<b>Signature:</b>

```typescript
unstakeHALAL(amount: Decimalish, overrides?: EthersTransactionOverrides): Promise<PopulatedEthersLiquityTransaction<void>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of HALAL to withdraw. |
|  overrides | [EthersTransactionOverrides](./lib-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;[PopulatedEthersLiquityTransaction](./lib-ethers.populatedethersliquitytransaction.md)<!-- -->&lt;void&gt;&gt;

## Remarks

As a side-effect, the transaction will also pay out the HALAL stake's [collateral gain](./lib-base.halalstake.collateralgain.md) and [USDH gain](./lib-base.halalstake.usdhgain.md)<!-- -->.

