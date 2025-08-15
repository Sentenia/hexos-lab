const fs = require("fs");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  const HEXOS = await ethers.getContractFactory("HEXOS");
  const hexos = await HEXOS.deploy(); await hexos.waitForDeployment();

  const XHEX = await ethers.getContractFactory("XHEX");
  const xhex = await XHEX.deploy(); await xhex.waitForDeployment();

  const StakeFactory = await ethers.getContractFactory("StakeFactory");
  const stakeFactory = await StakeFactory.deploy(await xhex.getAddress()); await stakeFactory.waitForDeployment();
  await (await xhex.transferOwnership(await stakeFactory.getAddress())).wait();

  const MintRouter = await ethers.getContractFactory("MintRouter");
  const mintRouter = await MintRouter.deploy(await hexos.getAddress(), await stakeFactory.getAddress()); await mintRouter.waitForDeployment();
  await (await deployer.sendTransaction({
    to: await mintRouter.getAddress(),
    value: ethers.parseEther("1000000") // e.g., 1,000,000 HEXOS to start
  })).wait();
  console.log("Funded MintRouter with 1,000,000 native HEXOS");
  await (await hexos.transferOwnership(await mintRouter.getAddress())).wait();

  const out = {
    HEXOS: await hexos.getAddress(),
    XHEX: await xhex.getAddress(),
    StakeFactory: await stakeFactory.getAddress(),
    MintRouter: await mintRouter.getAddress()
  };
  fs.writeFileSync("deploy.hexos.json", JSON.stringify(out, null, 2));
  console.log("HEXOS side deployed:", out);
}
main().catch(e=>{console.error(e);process.exit(1);});
