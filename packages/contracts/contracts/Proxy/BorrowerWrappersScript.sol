// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../Dependencies/SafeMath.sol";
import "../Dependencies/LiquityMath.sol";
import "../Dependencies/IERC20.sol";
import "../Interfaces/IBorrowerOperations.sol";
import "../Interfaces/ITroveManager.sol";
import "../Interfaces/IStabilityPool.sol";
import "../Interfaces/IPriceFeed.sol";
import "../Interfaces/IHALALStaking.sol";
import "./BorrowerOperationsScript.sol";
import "./ETHTransferScript.sol";
import "./HALALStakingScript.sol";
import "../Dependencies/console.sol";


contract BorrowerWrappersScript is BorrowerOperationsScript, ETHTransferScript, HALALStakingScript {
    using SafeMath for uint;

    string constant public NAME = "BorrowerWrappersScript";

    ITroveManager immutable troveManager;
    IStabilityPool immutable stabilityPool;
    IPriceFeed immutable priceFeed;
    IERC20 immutable usdhToken;
    IERC20 immutable halalToken;
    IHALALStaking immutable halalStaking;

    constructor(
        address _borrowerOperationsAddress,
        address _troveManagerAddress,
        address _halalStakingAddress
    )
        BorrowerOperationsScript(IBorrowerOperations(_borrowerOperationsAddress))
        HALALStakingScript(_halalStakingAddress)
        public
    {
        checkContract(_troveManagerAddress);
        ITroveManager troveManagerCached = ITroveManager(_troveManagerAddress);
        troveManager = troveManagerCached;

        IStabilityPool stabilityPoolCached = troveManagerCached.stabilityPool();
        checkContract(address(stabilityPoolCached));
        stabilityPool = stabilityPoolCached;

        IPriceFeed priceFeedCached = troveManagerCached.priceFeed();
        checkContract(address(priceFeedCached));
        priceFeed = priceFeedCached;

        address usdhTokenCached = address(troveManagerCached.usdhToken());
        checkContract(usdhTokenCached);
        usdhToken = IERC20(usdhTokenCached);

        address halalTokenCached = address(troveManagerCached.halalToken());
        checkContract(halalTokenCached);
        halalToken = IERC20(halalTokenCached);

        IHALALStaking halalStakingCached = troveManagerCached.halalStaking();
        require(_halalStakingAddress == address(halalStakingCached), "BorrowerWrappersScript: Wrong HALALStaking address");
        halalStaking = halalStakingCached;
    }

    function claimCollateralAndOpenTrove(uint _maxFee, uint _USDHAmount, address _upperHint, address _lowerHint) external payable {
        uint balanceBefore = address(this).balance;

        // Claim collateral
        borrowerOperations.claimCollateral();

        uint balanceAfter = address(this).balance;

        // already checked in CollSurplusPool
        assert(balanceAfter > balanceBefore);

        uint totalCollateral = balanceAfter.sub(balanceBefore).add(msg.value);

        // Open trove with obtained collateral, plus collateral sent by user
        borrowerOperations.openTrove{ value: totalCollateral }(_maxFee, _USDHAmount, _upperHint, _lowerHint);
    }

    function claimSPRewardsAndRecycle(uint _maxFee, address _upperHint, address _lowerHint) external {
        uint collBalanceBefore = address(this).balance;
        uint halalBalanceBefore = halalToken.balanceOf(address(this));

        // Claim rewards
        stabilityPool.withdrawFromSP(0);

        uint collBalanceAfter = address(this).balance;
        uint halalBalanceAfter = halalToken.balanceOf(address(this));
        uint claimedCollateral = collBalanceAfter.sub(collBalanceBefore);

        // Add claimed ETH to trove, get more USDH and stake it into the Stability Pool
        if (claimedCollateral > 0) {
            _requireUserHasTrove(address(this));
            uint USDHAmount = _getNetUSDHAmount(claimedCollateral);
            borrowerOperations.adjustTrove{ value: claimedCollateral }(_maxFee, 0, USDHAmount, true, _upperHint, _lowerHint);
            // Provide withdrawn USDH to Stability Pool
            if (USDHAmount > 0) {
                stabilityPool.provideToSP(USDHAmount, address(0));
            }
        }

        // Stake claimed HALAL
        uint claimedHALAL = halalBalanceAfter.sub(halalBalanceBefore);
        if (claimedHALAL > 0) {
            halalStaking.stake(claimedHALAL);
        }
    }

    function claimStakingGainsAndRecycle(uint _maxFee, address _upperHint, address _lowerHint) external {
        uint collBalanceBefore = address(this).balance;
        uint usdhBalanceBefore = usdhToken.balanceOf(address(this));
        uint halalBalanceBefore = halalToken.balanceOf(address(this));

        // Claim gains
        halalStaking.unstake(0);

        uint gainedCollateral = address(this).balance.sub(collBalanceBefore); // stack too deep issues :'(
        uint gainedUSDH = usdhToken.balanceOf(address(this)).sub(usdhBalanceBefore);

        uint netUSDHAmount;
        // Top up trove and get more USDH, keeping ICR constant
        if (gainedCollateral > 0) {
            _requireUserHasTrove(address(this));
            netUSDHAmount = _getNetUSDHAmount(gainedCollateral);
            borrowerOperations.adjustTrove{ value: gainedCollateral }(_maxFee, 0, netUSDHAmount, true, _upperHint, _lowerHint);
        }

        uint totalUSDH = gainedUSDH.add(netUSDHAmount);
        if (totalUSDH > 0) {
            stabilityPool.provideToSP(totalUSDH, address(0));

            // Providing to Stability Pool also triggers HALAL claim, so stake it if any
            uint halalBalanceAfter = halalToken.balanceOf(address(this));
            uint claimedHALAL = halalBalanceAfter.sub(halalBalanceBefore);
            if (claimedHALAL > 0) {
                halalStaking.stake(claimedHALAL);
            }
        }

    }

    function _getNetUSDHAmount(uint _collateral) internal returns (uint) {
        uint price = priceFeed.fetchPrice();
        uint ICR = troveManager.getCurrentICR(address(this), price);

        uint USDHAmount = _collateral.mul(price).div(ICR);
        uint borrowingRate = troveManager.getBorrowingRateWithDecay();
        uint netDebt = USDHAmount.mul(LiquityMath.DECIMAL_PRECISION).div(LiquityMath.DECIMAL_PRECISION.add(borrowingRate));

        return netDebt;
    }

    function _requireUserHasTrove(address _depositor) internal view {
        require(troveManager.getTroveStatus(_depositor) == 1, "BorrowerWrappersScript: caller must have an active trove");
    }
}
