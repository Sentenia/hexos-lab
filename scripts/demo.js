import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [deployer, user] = await ethers.getSigners();

  // ETH side
  const HEX = await ethers.getContractFactory("MockHEX");
  const hex = await HEX.deploy(); await hex.waitForDeployment();

  const BurnBridge = await ethers.getContractFactory("BurnBridge");
  const burnBridge = await BurnBridge.deploy(await hex.getAddress()); await burnBridge.waitForDeployment();

  await (await hex.transfer(user.address, ethers.parseUnits("200000", 8))).wait();

  // HEXOS side
  const HEXOS = await ethers.getContractFactory("HEXOS");
  const hexos = await HEXOS.deploy(); await hexos.waitForDeployment();

  const XHEX = await ethers.getContractFactory("XHEX");
  const xhex = await XHEX.deploy(); await xhex.waitForDeployment();

  const StakeFactory = await ethers.getContractFactory("StakeFactory");
  const stakeFactory = await StakeFactory.deploy(await xhex.getAddress()); await stakeFactory.waitForDeployment();
  await (await xhex.transferOwnership(await stakeFactory.getAddress())).wait();

  const MintRouter = await ethers.getContractFactory("MintRouter");
  const mintRouter = await MintRouter.deploy(await hexos.getAddress(), await stakeFactory.getAddress()); await mintRouter.waitForDeployment();
  await (await hexos.transferOwnership(await mintRouter.getAddress())).wait();

  // Burn 100,000 HEX → mint 100 HEXOS + auto 5555d stake
  const userHex = hex.connect(user);
  await (await userHex.approve(await burnBridge.getAddress(), ethers.parseUnits("100000", 8))).wait();
  await (await burnBridge.connect(user).burn(ethers.parseUnits("100000", 8), user.address)).wait();

  const proofId = ethers.keccak256(ethers.toUtf8Bytes("dev-proof-1"));
  await (await mintRouter.mintFromBurnProof(user.address, ethers.parseUnits("100000", 8), proofId)).wait();

  // Results
  const gasBal = await hexos.balanceOf(user.address);
  console.log("HEXOS minted:", ethers.formatUnits(gasBal, 18)); // expect 100

  const nextId = await stakeFactory.nextId();
  const stake = await stakeFactory.stakes(nextId);
  console.log("Stake user:", stake.user);
  console.log("Principal HEX (8dec):", ethers.formatUnits(stake.principalHex, 8)); // 100000
  console.log("Active:", stake.active, "Start:", Number(stake.startTs), "End:", Number(stake.endTs));
}

main().catch((e) => { console.error(e); process.exit(1); });

