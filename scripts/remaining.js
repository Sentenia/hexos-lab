const fs = require("fs");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const addrs = JSON.parse(fs.readFileSync("deploy.hexos.json", "utf8"));
  const MintRouter = await ethers.getContractFactory("MintRouter");
  const r = MintRouter.attach(addrs.MintRouter);

  const cap = await r.CAP_WEI?.().catch(()=>null); // if constant, skip
  const total = await r.totalDistributed();
  const remaining = await r.remaining().catch(()=> null);
  const today = await r.mintedToday();

  console.log("Total distributed:", ethers.formatEther(total), "HEXOS");
  if (remaining) console.log("Remaining cap:", ethers.formatEther(remaining), "HEXOS");
  if (today) console.log("Minted today:", ethers.formatEther(today), "HEXOS");
}
main().catch(e => { console.error(e); process.exit(1); });
