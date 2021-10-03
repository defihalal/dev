// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../HALAL/HALALStaking.sol";


contract HALALStakingTester is HALALStaking {
    function requireCallerIsTroveManager() external view {
        _requireCallerIsTroveManager();
    }
}
