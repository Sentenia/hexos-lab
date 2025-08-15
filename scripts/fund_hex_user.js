const fs = require("fs");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, user] = await ethers.getSigners();
  const eth = JSON.parse(fs.readFileSync("deploy.eth.json","utf8"));
  const HEX = await ethers.getContractFactory("MockHEX");
  const hex = HEX.attach(eth.MockHEX);

  const tx = await hex.transfer(user.address, ethers.parseUnits("200000", 8)); // 200k HEX
  await tx.wait();
  console.log("Funded user with 200,000 HEX");
}
main().catch(e=>{console.error(e);process.exit(1);});
