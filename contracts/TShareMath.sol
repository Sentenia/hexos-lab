// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library TShareMath {
    function start(uint256 principalHex, uint256 /*durationSeconds*/) internal pure returns (uint256) {
        // principal is 8-dec; scale ~to 18-dec for shares
        return principalHex * 1e10;
    }
}
