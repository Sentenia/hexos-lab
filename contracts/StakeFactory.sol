// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./XHEX.sol";
import "./TShareMath.sol";

contract StakeFactory {
    struct Stake {
        address user;
        uint256 principalHex; // 8-dec
        uint256 tShares;
        uint256 startTs;
        uint256 endTs;
        bool active;
    }

    XHEX public xhex;
    uint256 public nextId;
    mapping(uint256 => Stake) public stakes;

    event StakeStarted(uint256 id, address indexed user, uint256 principalHex, uint256 tShares, uint256 startTs, uint256 endTs);

    constructor(XHEX _xhex) { xhex = _xhex; }

    function createStake(address user, uint256 principalHex, uint256 durationSeconds) external returns (uint256 id) {
        xhex.mint(address(this), principalHex); // escrowed xHEX
        uint256 tShares = TShareMath.start(principalHex, durationSeconds);
        uint256 startTs = block.timestamp;
        uint256 endTs = startTs + durationSeconds;
        id = ++nextId;
        stakes[id] = Stake(user, principalHex, tShares, startTs, endTs, true);
        emit StakeStarted(id, user, principalHex, tShares, startTs, endTs);
    }
}
