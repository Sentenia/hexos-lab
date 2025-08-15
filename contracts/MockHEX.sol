// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MockHEX is ERC20, ERC20Burnable {
    constructor() ERC20("Mock HEX", "HEX") { _mint(msg.sender, 1_000_000e8); }
    function decimals() public pure override returns (uint8) { return 8; }
}
