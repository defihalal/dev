# Defi Halal Protocol: Decentralized Borrowing Protocol Without Any Interest

DeFi Halal Protocol provides a zero-interest way of borrowing USDH for an unlimited period as long as the borrowing meets above collateral requirements. 

DeFi Halal is effectively a more affordable version of Liquity, the open-source no-interest borrowing protocol on Ethereum. It's different as instead of the expensive Ethereum blockchain, it runs on Polygon Matic blockchain and it enjoys 200x more affordable minimum loan amounts and fees than Liquity. 

We've been studying and practicing various DeFi protocols and found the Liquity borrowing and stable coin project a very interesting one, especially it's no-interest nature, which is one of the principles of Islamic Finance where interest is prohibited.

At the same time, we found Liquity quite difficult to afford for the vast majority of users, including ourselves, because of its prohibitively high min loan amounts as well as really high fees for liquidation, redemption and loan issuance.

So we've decided to improve on these aspects, while keeping all the contracts exactly the same in all other respects and created DeFi Halal, a no-interest protocol deployed on Polygon. Its LQTY-equivalent token is called HALAL, while its LUSD-equivalent token is called USDH. It also benefits from a minimum loan size of not LUSD1,800, but USDH9 and fees of not LUSD200, but only USDH1. For collateral, It uses the native token of the Polygon network called MATIC, which is easy to obtain via various channels like decentralised or centralised marketplaces.


In summary, DeFi Halal protocol offers:

- Zero (0%) interest rate, consistent with the Islamic Finance principle of no-interest finance
- Unlimited period of borrowing as long as the collateral requirements are met
- Attractive minimum collateral ratio of only 110%
- Much lower gas fees compared to L1 protocols
- Much lower borrowing fees
- Much lower minimum borrowing amount
- HALAL token rewards to liquidity providers and borrowers in the initial stages of the protocol
- Liquidity providers earn by sharing in fees and liquidated positions if the collateral drops below 110%
- HALAL / MATIC swap contract available on Quickswap (fork of Uniswap on Polygon)
- Collateral in the form of MATIC on Polygon

Being identical in all respects, DeFi Halal Protocol contracts benefit from the audits done by Liquity on the same contracts as well as from being battle-tested over the time since their deployment. All of DeFi Halal's contracts' code is open and verified on Polygonscan so anyone can check to make sure the contracts are exactly the same as the audited and battle-tested Liquity contracts.

More information on the protocol mechanics can be found in the Liquity docs https://docs.liquity.org/ with the exception of the names of tokens (LUSD => USDH and LQTY => HALAL) as well as amount and fee parameters (200x more affordable for DeFi Halal).

If you are interested in running a frontend, please read more about it in the frontend repo: https://github.com/defihalal/frontend-registry 

