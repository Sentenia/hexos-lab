// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XHEX is ERC20, Ownable {
    constructor() ERC20("Mirrored HEX", "xHEX") Ownable(msg.sender) {}
    function mint(address to, uint256 amt) external onlyOwner { _mint(to, amt); }
    function burn(address from, uint256 amt) external onlyOwner { _burn(from, amt); }
}
