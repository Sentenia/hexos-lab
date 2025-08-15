const fs = require("fs");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, user] = await ethers.getSigners();

  const eth = JSON.parse(fs.readFileSync("deploy.eth.json", "utf8"));

  const HEX = await ethers.getContractFactory("MockHEX");
  const hex = HEX.attach(eth.MockHEX);

  const BurnBridge = await ethers.getContractFactory("BurnBridge");
  const burnBridge = BurnBridge.attach(eth.BurnBridge);

  await (await hex.connect(user).approve(eth.BurnBridge, ethers.parseUnits("100000", 8))).wait();

  const tx = await burnBridge.connect(user).burn(ethers.parseUnits("100000", 8), user.address);
  await tx.wait();

  console.log("Burn tx:", tx.hash);
}

main().catch((e) => { console.error(e); process.exit(1); });
