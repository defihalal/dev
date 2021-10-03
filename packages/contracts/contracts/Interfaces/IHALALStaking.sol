// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

interface IHALALStaking {

    // --- Events --
    
    event HALALTokenAddressSet(address _halalTokenAddress);
    event USDHTokenAddressSet(address _usdhTokenAddress);
    event TroveManagerAddressSet(address _troveManager);
    event BorrowerOperationsAddressSet(address _borrowerOperationsAddress);
    event ActivePoolAddressSet(address _activePoolAddress);

    event StakeChanged(address indexed staker, uint newStake);
    event StakingGainsWithdrawn(address indexed staker, uint USDHGain, uint ETHGain);
    event F_ETHUpdated(uint _F_ETH);
    event F_USDHUpdated(uint _F_USDH);
    event TotalHALALStakedUpdated(uint _totalHALALStaked);
    event EtherSent(address _account, uint _amount);
    event StakerSnapshotsUpdated(address _staker, uint _F_ETH, uint _F_USDH);

    // --- Functions ---

    function setAddresses
    (
        address _halalTokenAddress,
        address _usdhTokenAddress,
        address _troveManagerAddress, 
        address _borrowerOperationsAddress,
        address _activePoolAddress
    )  external;

    function stake(uint _HALALamount) external;

    function unstake(uint _HALALamount) external;

    function increaseF_ETH(uint _ETHFee) external; 

    function increaseF_USDH(uint _HALALFee) external;  

    function getPendingETHGain(address _user) external view returns (uint);

    function getPendingUSDHGain(address _user) external view returns (uint);
}
