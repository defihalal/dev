// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../Dependencies/BaseMath.sol";
import "../Dependencies/SafeMath.sol";
import "../Dependencies/Ownable.sol";
import "../Dependencies/CheckContract.sol";
import "../Dependencies/console.sol";
import "../Interfaces/IHALALToken.sol";
import "../Interfaces/IHALALStaking.sol";
import "../Dependencies/LiquityMath.sol";
import "../Interfaces/IUSDHToken.sol";

contract HALALStaking is IHALALStaking, Ownable, CheckContract, BaseMath {
    using SafeMath for uint;

    // --- Data ---
    string constant public NAME = "HALALStaking";

    mapping( address => uint) public stakes;
    uint public totalHALALStaked;

    uint public F_ETH;  // Running sum of ETH fees per-HALAL-staked
    uint public F_USDH; // Running sum of HALAL fees per-HALAL-staked

    // User snapshots of F_ETH and F_USDH, taken at the point at which their latest deposit was made
    mapping (address => Snapshot) public snapshots; 

    struct Snapshot {
        uint F_ETH_Snapshot;
        uint F_USDH_Snapshot;
    }
    
    IHALALToken public halalToken;
    IUSDHToken public usdhToken;

    address public troveManagerAddress;
    address public borrowerOperationsAddress;
    address public activePoolAddress;

    // --- Events ---

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
    ) 
        external 
        onlyOwner 
        override 
    {
        checkContract(_halalTokenAddress);
        checkContract(_usdhTokenAddress);
        checkContract(_troveManagerAddress);
        checkContract(_borrowerOperationsAddress);
        checkContract(_activePoolAddress);

        halalToken = IHALALToken(_halalTokenAddress);
        usdhToken = IUSDHToken(_usdhTokenAddress);
        troveManagerAddress = _troveManagerAddress;
        borrowerOperationsAddress = _borrowerOperationsAddress;
        activePoolAddress = _activePoolAddress;

        emit HALALTokenAddressSet(_halalTokenAddress);
        emit HALALTokenAddressSet(_usdhTokenAddress);
        emit TroveManagerAddressSet(_troveManagerAddress);
        emit BorrowerOperationsAddressSet(_borrowerOperationsAddress);
        emit ActivePoolAddressSet(_activePoolAddress);

        _renounceOwnership();
    }

    // If caller has a pre-existing stake, send any accumulated ETH and USDH gains to them. 
    function stake(uint _HALALamount) external override {
        _requireNonZeroAmount(_HALALamount);

        uint currentStake = stakes[msg.sender];

        uint ETHGain;
        uint USDHGain;
        // Grab any accumulated ETH and USDH gains from the current stake
        if (currentStake != 0) {
            ETHGain = _getPendingETHGain(msg.sender);
            USDHGain = _getPendingUSDHGain(msg.sender);
        }
    
       _updateUserSnapshots(msg.sender);

        uint newStake = currentStake.add(_HALALamount);

        // Increase user’s stake and total HALAL staked
        stakes[msg.sender] = newStake;
        totalHALALStaked = totalHALALStaked.add(_HALALamount);
        emit TotalHALALStakedUpdated(totalHALALStaked);

        // Transfer HALAL from caller to this contract
        halalToken.sendToHALALStaking(msg.sender, _HALALamount);

        emit StakeChanged(msg.sender, newStake);
        emit StakingGainsWithdrawn(msg.sender, USDHGain, ETHGain);

         // Send accumulated USDH and ETH gains to the caller
        if (currentStake != 0) {
            usdhToken.transfer(msg.sender, USDHGain);
            _sendETHGainToUser(ETHGain);
        }
    }

    // Unstake the HALAL and send the it back to the caller, along with their accumulated USDH & ETH gains. 
    // If requested amount > stake, send their entire stake.
    function unstake(uint _HALALamount) external override {
        uint currentStake = stakes[msg.sender];
        _requireUserHasStake(currentStake);

        // Grab any accumulated ETH and USDH gains from the current stake
        uint ETHGain = _getPendingETHGain(msg.sender);
        uint USDHGain = _getPendingUSDHGain(msg.sender);
        
        _updateUserSnapshots(msg.sender);

        if (_HALALamount > 0) {
            uint HALALToWithdraw = LiquityMath._min(_HALALamount, currentStake);

            uint newStake = currentStake.sub(HALALToWithdraw);

            // Decrease user's stake and total HALAL staked
            stakes[msg.sender] = newStake;
            totalHALALStaked = totalHALALStaked.sub(HALALToWithdraw);
            emit TotalHALALStakedUpdated(totalHALALStaked);

            // Transfer unstaked HALAL to user
            halalToken.transfer(msg.sender, HALALToWithdraw);

            emit StakeChanged(msg.sender, newStake);
        }

        emit StakingGainsWithdrawn(msg.sender, USDHGain, ETHGain);

        // Send accumulated USDH and ETH gains to the caller
        usdhToken.transfer(msg.sender, USDHGain);
        _sendETHGainToUser(ETHGain);
    }

    // --- Reward-per-unit-staked increase functions. Called by Liquity core contracts ---

    function increaseF_ETH(uint _ETHFee) external override {
        _requireCallerIsTroveManager();
        uint ETHFeePerHALALStaked;
     
        if (totalHALALStaked > 0) {ETHFeePerHALALStaked = _ETHFee.mul(DECIMAL_PRECISION).div(totalHALALStaked);}

        F_ETH = F_ETH.add(ETHFeePerHALALStaked); 
        emit F_ETHUpdated(F_ETH);
    }

    function increaseF_USDH(uint _USDHFee) external override {
        _requireCallerIsBorrowerOperations();
        uint USDHFeePerHALALStaked;
        
        if (totalHALALStaked > 0) {USDHFeePerHALALStaked = _USDHFee.mul(DECIMAL_PRECISION).div(totalHALALStaked);}
        
        F_USDH = F_USDH.add(USDHFeePerHALALStaked);
        emit F_USDHUpdated(F_USDH);
    }

    // --- Pending reward functions ---

    function getPendingETHGain(address _user) external view override returns (uint) {
        return _getPendingETHGain(_user);
    }

    function _getPendingETHGain(address _user) internal view returns (uint) {
        uint F_ETH_Snapshot = snapshots[_user].F_ETH_Snapshot;
        uint ETHGain = stakes[_user].mul(F_ETH.sub(F_ETH_Snapshot)).div(DECIMAL_PRECISION);
        return ETHGain;
    }

    function getPendingUSDHGain(address _user) external view override returns (uint) {
        return _getPendingUSDHGain(_user);
    }

    function _getPendingUSDHGain(address _user) internal view returns (uint) {
        uint F_USDH_Snapshot = snapshots[_user].F_USDH_Snapshot;
        uint USDHGain = stakes[_user].mul(F_USDH.sub(F_USDH_Snapshot)).div(DECIMAL_PRECISION);
        return USDHGain;
    }

    // --- Internal helper functions ---

    function _updateUserSnapshots(address _user) internal {
        snapshots[_user].F_ETH_Snapshot = F_ETH;
        snapshots[_user].F_USDH_Snapshot = F_USDH;
        emit StakerSnapshotsUpdated(_user, F_ETH, F_USDH);
    }

    function _sendETHGainToUser(uint ETHGain) internal {
        emit EtherSent(msg.sender, ETHGain);
        (bool success, ) = msg.sender.call{value: ETHGain}("");
        require(success, "HALALStaking: Failed to send accumulated ETHGain");
    }

    // --- 'require' functions ---

    function _requireCallerIsTroveManager() internal view {
        require(msg.sender == troveManagerAddress, "HALALStaking: caller is not TroveM");
    }

    function _requireCallerIsBorrowerOperations() internal view {
        require(msg.sender == borrowerOperationsAddress, "HALALStaking: caller is not BorrowerOps");
    }

     function _requireCallerIsActivePool() internal view {
        require(msg.sender == activePoolAddress, "HALALStaking: caller is not ActivePool");
    }

    function _requireUserHasStake(uint currentStake) internal pure {  
        require(currentStake > 0, 'HALALStaking: User must have a non-zero stake');  
    }

    function _requireNonZeroAmount(uint _amount) internal pure {
        require(_amount > 0, 'HALALStaking: Amount must be non-zero');
    }

    receive() external payable {
        _requireCallerIsActivePool();
    }
}
