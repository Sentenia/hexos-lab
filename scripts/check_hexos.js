const fs = require("fs");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const userAddr = JSON.parse(fs.readFileSync("deploy.eth.json", "utf8")).user;
  const addrs = JSON.parse(fs.readFileSync("deploy.hexos.json", "utf8"));

  const HEXOS = await ethers.getContractFactory("HEXOS");
  const hexos = HEXOS.attach(addrs.HEXOS);

  const StakeFactory = await ethers.getContractFactory("StakeFactory");
  const stakeFactory = StakeFactory.attach(addrs.StakeFactory);

  const bal = await hexos.balanceOf(userAddr);
  console.log("HEXOS balance:", ethers.formatUnits(bal, 18));

  const nextId = await stakeFactory.nextId();
  const stake = await stakeFactory.stakes(nextId);
  console.log("Stake user:", stake.user);
  console.log("Principal (HEX, 8dec):", ethers.formatUnits(stake.principalHex, 8));
  console.log("Active:", stake.active, "Start:", Number(stake.startTs), "End:", Number(stake.endTs));
}

main().catch(e => { console.error(e); process.exit(1); });
