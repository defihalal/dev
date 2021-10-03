// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;
    
interface ILockupContractFactory {
    
    // --- Events ---

    event HALALTokenAddressSet(address _halalTokenAddress);
    event LockupContractDeployedThroughFactory(address _lockupContractAddress, address _beneficiary, uint _unlockTime, address _deployer);

    // --- Functions ---

    function setHALALTokenAddress(address _halalTokenAddress) external;

    function deployLockupContract(address _beneficiary, uint _unlockTime) external;

    function isRegisteredLockup(address _addr) external view returns (bool);
}
