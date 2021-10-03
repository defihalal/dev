// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../Interfaces/IUSDHToken.sol";

contract USDHTokenCaller {
    IUSDHToken USDH;

    function setUSDH(IUSDHToken _USDH) external {
        USDH = _USDH;
    }

    function usdhMint(address _account, uint _amount) external {
        USDH.mint(_account, _amount);
    }

    function usdhBurn(address _account, uint _amount) external {
        USDH.burn(_account, _amount);
    }

    function usdhSendToPool(address _sender,  address _poolAddress, uint256 _amount) external {
        USDH.sendToPool(_sender, _poolAddress, _amount);
    }

    function usdhReturnFromPool(address _poolAddress, address _receiver, uint256 _amount ) external {
        USDH.returnFromPool(_poolAddress, _receiver, _amount);
    }
}
