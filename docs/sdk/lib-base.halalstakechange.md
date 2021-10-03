<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@liquity/lib-base](./lib-base.md) &gt; [HALALStakeChange](./lib-base.halalstakechange.md)

## HALALStakeChange type

Represents the change between two states of an HALAL Stake.

<b>Signature:</b>

```typescript
export declare type HALALStakeChange<T> = {
    stakeHALAL: T;
    unstakeHALAL?: undefined;
} | {
    stakeHALAL?: undefined;
    unstakeHALAL: T;
    unstakeAllHALAL: boolean;
};
```