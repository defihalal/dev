<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-ethers](./lib-ethers.md) &gt; [SendableEthersLiquity](./lib-ethers.sendableethersliquity.md) &gt; [sendUSDH](./lib-ethers.sendableethersliquity.sendusdh.md)

## SendableEthersLiquity.sendUSDH() method

Send USDH tokens to an address.

<b>Signature:</b>

```typescript
sendUSDH(toAddress: string, amount: Decimalish, overrides?: EthersTransactionOverrides): Promise<SentEthersLiquityTransaction<void>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  toAddress | string | Address of receipient. |
|  amount | [Decimalish](./lib-base.decimalish.md) | Amount of USDH to send. |
|  overrides | [EthersTransactionOverrides](./lib-ethers.etherstransactionoverrides.md) |  |

<b>Returns:</b>

Promise&lt;[SentEthersLiquityTransaction](./lib-ethers.sentethersliquitytransaction.md)<!-- -->&lt;void&gt;&gt;

