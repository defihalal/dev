// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../TroveManager.sol";
import "../BorrowerOperations.sol";
import "../StabilityPool.sol";
import "../USDHToken.sol";

contract EchidnaProxy {
    TroveManager troveManager;
    BorrowerOperations borrowerOperations;
    StabilityPool stabilityPool;
    USDHToken usdhToken;

    constructor(
        TroveManager _troveManager,
        BorrowerOperations _borrowerOperations,
        StabilityPool _stabilityPool,
        USDHToken _usdhToken
    ) public {
        troveManager = _troveManager;
        borrowerOperations = _borrowerOperations;
        stabilityPool = _stabilityPool;
        usdhToken = _usdhToken;
    }

    receive() external payable {
        // do nothing
    }

    // TroveManager

    function liquidatePrx(address _user) external {
        troveManager.liquidate(_user);
    }

    function liquidateTrovesPrx(uint _n) external {
        troveManager.liquidateTroves(_n);
    }

    function batchLiquidateTrovesPrx(address[] calldata _troveArray) external {
        troveManager.batchLiquidateTroves(_troveArray);
    }

    function redeemCollateralPrx(
        uint _USDHAmount,
        address _firstRedemptionHint,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint,
        uint _partialRedemptionHintNICR,
        uint _maxIterations,
        uint _maxFee
    ) external {
        troveManager.redeemCollateral(_USDHAmount, _firstRedemptionHint, _upperPartialRedemptionHint, _lowerPartialRedemptionHint, _partialRedemptionHintNICR, _maxIterations, _maxFee);
    }

    // Borrower Operations
    function openTrovePrx(uint _ETH, uint _USDHAmount, address _upperHint, address _lowerHint, uint _maxFee) external payable {
        borrowerOperations.openTrove{value: _ETH}(_maxFee, _USDHAmount, _upperHint, _lowerHint);
    }

    function addCollPrx(uint _ETH, address _upperHint, address _lowerHint) external payable {
        borrowerOperations.addColl{value: _ETH}(_upperHint, _lowerHint);
    }

    function withdrawCollPrx(uint _amount, address _upperHint, address _lowerHint) external {
        borrowerOperations.withdrawColl(_amount, _upperHint, _lowerHint);
    }

    function withdrawUSDHPrx(uint _amount, address _upperHint, address _lowerHint, uint _maxFee) external {
        borrowerOperations.withdrawUSDH(_maxFee, _amount, _upperHint, _lowerHint);
    }

    function repayUSDHPrx(uint _amount, address _upperHint, address _lowerHint) external {
        borrowerOperations.repayUSDH(_amount, _upperHint, _lowerHint);
    }

    function closeTrovePrx() external {
        borrowerOperations.closeTrove();
    }

    function adjustTrovePrx(uint _ETH, uint _collWithdrawal, uint _debtChange, bool _isDebtIncrease, address _upperHint, address _lowerHint, uint _maxFee) external payable {
        borrowerOperations.adjustTrove{value: _ETH}(_maxFee, _collWithdrawal, _debtChange, _isDebtIncrease, _upperHint, _lowerHint);
    }

    // Pool Manager
    function provideToSPPrx(uint _amount, address _frontEndTag) external {
        stabilityPool.provideToSP(_amount, _frontEndTag);
    }

    function withdrawFromSPPrx(uint _amount) external {
        stabilityPool.withdrawFromSP(_amount);
    }

    // USDH Token

    function transferPrx(address recipient, uint256 amount) external returns (bool) {
        return usdhToken.transfer(recipient, amount);
    }

    function approvePrx(address spender, uint256 amount) external returns (bool) {
        return usdhToken.approve(spender, amount);
    }

    function transferFromPrx(address sender, address recipient, uint256 amount) external returns (bool) {
        return usdhToken.transferFrom(sender, recipient, amount);
    }

    function increaseAllowancePrx(address spender, uint256 addedValue) external returns (bool) {
        return usdhToken.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowancePrx(address spender, uint256 subtractedValue) external returns (bool) {
        return usdhToken.decreaseAllowance(spender, subtractedValue);
    }
}
