const fs = require("fs");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, user] = await ethers.getSigners();

  const HEX = await ethers.getContractFactory("MockHEX");
  const hex = await HEX.deploy(); await hex.waitForDeployment();

  const BurnBridge = await ethers.getContractFactory("BurnBridge");
  const burnBridge = await BurnBridge.deploy(await hex.getAddress()); await burnBridge.waitForDeployment();

  await (await hex.transfer(user.address, ethers.parseUnits("200000", 8))).wait();

  const out = {
    MockHEX: await hex.getAddress(),
    BurnBridge: await burnBridge.getAddress(),
    user: user.address
  };
  fs.writeFileSync("deploy.eth.json", JSON.stringify(out, null, 2));
  console.log("ETH side deployed:", out);
}
main().catch(e=>{console.error(e);process.exit(1);});
