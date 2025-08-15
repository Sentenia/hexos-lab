const fs = require("fs");
const { ethers } = require("ethers");

const eth = JSON.parse(fs.readFileSync("deploy.eth.json"));
const hexos = JSON.parse(fs.readFileSync("deploy.hexos.json"));

const ethProvider   = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const hexosProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8546");

const signer = new ethers.Wallet(process.env.RELAYER_PK, hexosProvider);

const burnBridgeAbi = require("../artifacts/contracts/BurnBridge.sol/BurnBridge.json").abi;
const mintRouterAbi = require("../artifacts/contracts/MintRouter.sol/MintRouter.json").abi;

const burnBridge = new ethers.Contract(eth.BurnBridge, burnBridgeAbi, ethProvider);
const mintRouter = new ethers.Contract(hexos.MintRouter, mintRouterAbi, signer);

console.log("Relayer up. Waiting for Burned events...");
burnBridge.on("Burned", async (recipient, amountHEX, _blk, maybeProof, event) => {
  try {
    const proof = (typeof maybeProof === "string" && maybeProof.startsWith("0x"))
      ? maybeProof
      : (event?.log?.transactionHash || event?.transactionHash);

    console.log("Burned:", recipient, amountHEX.toString(), "proof:", proof);
    if (!proof) { console.log("No proof found; skipping."); return; }

    // NEW: skip if already used
    const already = await mintRouter.usedProof(proof);
    if (already) { console.log("Proof already used; skipping."); return; }

    const minConf = 6;
    let cur = await ethProvider.getBlockNumber();
    while (cur < event.log.blockNumber + minConf) {
      await new Promise(r => setTimeout(r, 1000));
      cur = await ethProvider.getBlockNumber();
    }

    const tx = await mintRouter.mintFromBurnProof(recipient, amountHEX, proof, { gasPrice: 1n });
    await tx.wait();
    console.log("Minted on HEXOS.");
  } catch (e) {
    console.error("Relay error:", e.message);
  }
});


