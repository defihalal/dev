// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../HALAL/CommunityIssuance.sol";

contract CommunityIssuanceTester is CommunityIssuance {
    function obtainHALAL(uint _amount) external {
        halalToken.transfer(msg.sender, _amount);
    }

    function getCumulativeIssuanceFraction() external view returns (uint) {
       return _getCumulativeIssuanceFraction();
    }

    function unprotectedIssueHALAL() external returns (uint) {
        // No checks on caller address
       
        uint latestTotalHALALIssued = HALALSupplyCap.mul(_getCumulativeIssuanceFraction()).div(DECIMAL_PRECISION);
        uint issuance = latestTotalHALALIssued.sub(totalHALALIssued);
      
        totalHALALIssued = latestTotalHALALIssued;
        return issuance;
    }
}
