const fs = require("fs");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const user = JSON.parse(fs.readFileSync("deploy.eth.json","utf8")).user;
  const addrs = JSON.parse(fs.readFileSync("deploy.hexos.json","utf8"));
  const StakeFactory = await ethers.getContractFactory("StakeFactory");
  const sf = StakeFactory.attach(addrs.StakeFactory);

  const nextIdBN = await sf.nextId();
  const nextId = Number(nextIdBN);
  console.log("Total stakes:", nextId);

  let found = false;
  for (let i = 1; i <= nextId; i++) {
    const s = await sf.stakes(i);
    if (s.user.toLowerCase() === user.toLowerCase()) {
      found = true;
      console.log(
        `ID ${i}: principal=${ethers.formatUnits(s.principalHex, 8)} HEX, ` +
        `active=${s.active}, start=${Number(s.startTs)}, end=${Number(s.endTs)}`
      );
    }
  }
  if (!found) console.log("No stakes for", user);
}

main().catch(e => { console.error(e); process.exit(1); });
