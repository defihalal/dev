<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [USDH\_MINIMUM\_NET\_DEBT](./lib-base.usdh_minimum_net_debt.md)

## USDH\_MINIMUM\_NET\_DEBT variable

A Trove must always have at least this much debt on top of the [liquidation reserve](./lib-base.usdh_liquidation_reserve.md)<!-- -->.

<b>Signature:</b>

```typescript
USDH_MINIMUM_NET_DEBT: Decimal
```

## Remarks

Any transaction that would result in a Trove with less net debt than this will be reverted.

