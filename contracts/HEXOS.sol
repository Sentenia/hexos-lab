// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HEXOS is ERC20, Ownable {
    constructor() ERC20("HEXOS Gas", "HEXOS") Ownable(msg.sender) {}
    function mint(address to, uint256 amt) external onlyOwner { _mint(to, amt); }
}
