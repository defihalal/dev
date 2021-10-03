// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

interface ICommunityIssuance { 
    
    // --- Events ---
    
    event HALALTokenAddressSet(address _halalTokenAddress);
    event StabilityPoolAddressSet(address _stabilityPoolAddress);
    event TotalHALALIssuedUpdated(uint _totalHALALIssued);

    // --- Functions ---

    function setAddresses(address _halalTokenAddress, address _stabilityPoolAddress) external;

    function issueHALAL() external returns (uint);

    function sendHALAL(address _account, uint _HALALamount) external;
}
