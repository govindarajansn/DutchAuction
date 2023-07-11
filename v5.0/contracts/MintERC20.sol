// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract ERC20Token is ERC20, ERC20Permit {

    uint256 immutable totalERC20Supply;
    uint256 currenltyUsed;

    constructor(uint256 _totalERC20Supply) ERC20("ERC20Token", "ERC20") ERC20Permit("ERC20Token") {
        totalERC20Supply = _totalERC20Supply;
    }

    function getTotalERC20Supply() public view returns(uint256){
        return totalERC20Supply;
    }

    function mintERC20(address to, uint256 amount) public {
        require((currenltyUsed + amount) <= totalERC20Supply, "Maximum amount of ERC20 minting has exceeded");
        _mint(to, amount);
        currenltyUsed += amount;
    }
}