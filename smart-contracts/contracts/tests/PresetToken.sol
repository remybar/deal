//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * ERC2O token with a preset initial supply of 1_000_000 tokens.
 * (used for testing)
 */
contract PresetToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** uint(decimals()));
    }
}