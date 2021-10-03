// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../ActivePool.sol";

contract ActivePoolTester is ActivePool {
    
    function unprotectedIncreaseUSDHDebt(uint _amount) external {
        USDHDebt  = USDHDebt.add(_amount);
    }

    function unprotectedPayable() external payable {
        ETH = ETH.add(msg.value);
    }
}
