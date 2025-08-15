const fs = require("fs");
const { ethers } = require("hardhat");
async function main() {
  const addrs = JSON.parse(fs.readFileSync("deploy.hexos.json","utf8"));
  for (const [name, addr] of Object.entries(addrs)) {
    const code = await ethers.provider.getCode(addr);
    console.log(name, addr, "=>", code === "0x" ? "NOT DEPLOYED" : "OK");
  }
}
main().catch(e=>{console.error(e);process.exit(1);});
