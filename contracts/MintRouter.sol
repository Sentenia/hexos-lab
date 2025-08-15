// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IStakeFactory { function createStake(address user, uint256 amountHex) external; }

contract MintRouter {
    // Conversion: 1000 HEX (8 dec) -> 1 HEXOS native (18 dec)
    uint256 public constant HEX_TO_HEXOS_DENOM = 1000;

    // Hard cap: 1,000,000,000 HEXOS (native) maximum ever distributed
    uint256 public constant CAP_WEI = 1_000_000_000 ether;

    // Daily cap (native HEXOS). Tune for your game.
    uint256 public constant DAILY_CAP_WEI = 5_000_000 ether;

    // Per-burn limit (HEX, 8 decimals). Example: 10,000,000 HEX max per proof.
    uint256 public constant MAX_BURN_PER_PROOF_8 = 10_000_000 * 1e8;

    // Small-holder boost: +15% on the first 100k HEX (lifetime)
    uint256 public constant SMALL_CAP_8 = 100_000 * 1e8;
    uint16  public constant BOOST_BPS   = 1500; // 15%

    // Cooldown per address (seconds). Keep small for UX; bump later if needed.
    uint256 public constant COOLDOWN = 60;

    // ---- state ----
    mapping(bytes32 => bool) public usedProof;     // replay protection
    IStakeFactory public stakeFactory;
    uint256 public totalDistributed;               // native HEXOS sent (wei)
    mapping(uint256 => uint256) public mintedPerDay;   // dayIndex => wei
    mapping(address => uint256) public lifetimeBurned; // HEX (8 dec)
    mapping(address => uint256) public lastMintTs;     // last successful mint ts

    event Minted(address indexed to, uint256 amountHEX_8dec, uint256 hexosWei, bytes32 proofId);
    event Limits(uint256 day, uint256 mintedTodayWei, uint256 totalDistributedWei);

    // Keep old constructor signature so your deploy script doesn't change.
    constructor(address /*hexosUnused*/, address stakeFactory_) { stakeFactory = IStakeFactory(stakeFactory_); }

    // Fund the router with native HEXOS so it can pay users
    receive() external payable {}

    function mintFromBurnProof(address to, uint256 amountHEX_8dec, bytes32 proofId) external {
        require(!usedProof[proofId], "proof used");
        usedProof[proofId] = true;

        require(amountHEX_8dec <= MAX_BURN_PER_PROOF_8, "too big");
        require(block.timestamp >= lastMintTs[to] + COOLDOWN, "cooldown");

        // Base native payout: wei = amountHEX * 1e18 / (1000 * 1e8) = amountHEX * 1e10 / 1000
        uint256 baseWei = (amountHEX_8dec * 1e10) / HEX_TO_HEXOS_DENOM;

        // Apply small-holder bonus on first SMALL_CAP_8 HEX (lifetime)
        uint256 hexosWei = _applySmallBonus(to, amountHEX_8dec, baseWei);

        // Global + daily caps
        require(totalDistributed + hexosWei <= CAP_WEI, "cap reached");
        uint256 day = block.timestamp / 1 days;
        require(mintedPerDay[day] + hexosWei <= DAILY_CAP_WEI, "daily cap");

        // Payout native + mirror stake
        require(address(this).balance >= hexosWei, "router underfunded");
        (bool ok, ) = payable(to).call{value: hexosWei}("");
        require(ok, "native send failed");

        totalDistributed += hexosWei;
        mintedPerDay[day] += hexosWei;
        lastMintTs[to] = block.timestamp;

        // Mirror 5555d stake (principal tracked in HEX 8 dec)
        stakeFactory.createStake(to, amountHEX_8dec);

        emit Minted(to, amountHEX_8dec, hexosWei, proofId);
        emit Limits(day, mintedPerDay[day], totalDistributed);
    }

    function _applySmallBonus(address to, uint256 amountHex8, uint256 baseWei) internal returns (uint256) {
        uint256 used = lifetimeBurned[to];
        uint256 eligible = 0;
        if (used < SMALL_CAP_8) {
            uint256 room = SMALL_CAP_8 - used;
            eligible = amountHex8 < room ? amountHex8 : room;
        }
        lifetimeBurned[to] = used + amountHex8;

        if (eligible == 0) return baseWei;

        // Pro-rate baseWei between eligible (bonus) and remainder
        // Note: integer math; tiny truncation is fine for our use.
        uint256 weiPerHex8 = baseWei / amountHex8;
        uint256 basePart   = (amountHex8 - eligible) * weiPerHex8;
        uint256 bonusPart  = (eligible * weiPerHex8 * (10_000 + BOOST_BPS)) / 10_000;
        uint256 out = basePart + bonusPart;
        if (out < baseWei) return baseWei; // guard against underflow due to truncation
        return out;
    }

    // ---- views / helpers ----
    function remaining() external view returns (uint256) { return CAP_WEI - totalDistributed; }
    function mintedToday() external view returns (uint256) { return mintedPerDay[block.timestamp / 1 days]; }
    function userInfo(address user) external view returns (uint256 lifetimeHex8, uint256 lastMint) {
        return (lifetimeBurned[user], lastMintTs[user]);
    }
}
