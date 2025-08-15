// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IHEXBurnable { function burnFrom(address account, uint256 amount) external; }

contract BurnBridge {
    event Burned(address indexed recipientOnHexos, uint256 amountHEX, uint256 ethBlock, bytes32 proofId);

    IHEXBurnable public hexToken;

    constructor(IHEXBurnable _hex) { hexToken = _hex; }

    // user must approve this contract first
    function burn(uint256 amountHEX, address recipientOnHexos) external {
        hexToken.burnFrom(msg.sender, amountHEX);
        bytes32 proofId = keccak256(abi.encodePacked(msg.sender, block.number, amountHEX, recipientOnHexos));
        emit Burned(recipientOnHexos, amountHEX, block.number, proofId);
    }
}
