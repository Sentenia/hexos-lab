const fs=require("fs"); const {ethers}=require("hardhat");
async function main(){
  const addrs=JSON.parse(fs.readFileSync("deploy.hexos.json","utf8"));
  const MintRouter=await ethers.getContractFactory("MintRouter");
  const r=MintRouter.attach(addrs.MintRouter);
  const bal=await r.routerBalance();
  console.log("Router native balance:", ethers.formatEther(bal), "HEXOS");
}
main().catch(e=>{console.error(e);process.exit(1);});
