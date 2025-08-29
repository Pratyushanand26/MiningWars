// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    address public minter;

    constructor() ERC20("pratyCoin", "PMT") {
        minter = msg.sender;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Not authorized to mint");
        _;
    }

    function setMinter(address _minter) external onlyMinter {
        minter = _minter;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
