// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../Dependencies/CheckContract.sol";
import "../Interfaces/IHALALStaking.sol";


contract HALALStakingScript is CheckContract {
    IHALALStaking immutable HALALStaking;

    constructor(address _halalStakingAddress) public {
        checkContract(_halalStakingAddress);
        HALALStaking = IHALALStaking(_halalStakingAddress);
    }

    function stake(uint _HALALamount) external {
        HALALStaking.stake(_HALALamount);
    }
}
