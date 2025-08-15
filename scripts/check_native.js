const fs = require("fs");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const user = JSON.parse(fs.readFileSync("deploy.eth.json","utf8")).user;
  const addrs = JSON.parse(fs.readFileSync("deploy.hexos.json","utf8"));

  const balWei = await ethers.provider.getBalance(user);
  console.log("Native HEXOS:", ethers.formatEther(balWei));

  const StakeFactory = await ethers.getContractFactory("StakeFactory");
  const sf = StakeFactory.attach(addrs.StakeFactory);

  const nextId = Number(await sf.nextId());
  if (nextId === 0) return console.log("No stakes yet.");
  const s = await sf.stakes(nextId);
  console.log("Stake user:", s.user);
  console.log("Principal HEX (8dec):", ethers.formatUnits(s.principalHex, 8));
  console.log("Active:", s.active, "Start:", Number(s.startTs), "End:", Number(s.endTs));
}
main().catch(e=>{console.error(e);process.exit(1);});
