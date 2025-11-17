import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:drawFortune")
  .setDescription("Draw a new fortune")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const MorningLightLots = await deployments.get("MorningLightLots");
    const contract = await ethers.getContractAt("MorningLightLots", MorningLightLots.address);

    const [signer] = await ethers.getSigners();

    // Check if can draw
    const canDraw = await contract.canDrawNow();
    if (!canDraw) {
      const remaining = await contract.getRemainingCooldown();
      const todayCount = await contract.getTodayDrawCount();
      
      if (remaining > 0n) {
        console.log(`❌ Cannot draw: cooldown period (${remaining}s remaining)`);
      } else if (todayCount >= 1n) {
        console.log(`❌ Cannot draw: daily limit reached (${todayCount}/1)`);
      }
      return;
    }

    console.log(`🎲 Drawing fortune for ${signer.address}...`);
    const tx = await contract.drawFortune();
    const receipt = await tx.wait();

    console.log(`✅ Fortune drawn! Transaction: ${receipt!.hash}`);
    
    const fortuneCount = await contract.getMyFortuneCount();
    console.log(`📜 Total fortunes: ${fortuneCount}`);
  });

task("task:getMyFortunes")
  .setDescription("Get all my fortunes")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const MorningLightLots = await deployments.get("MorningLightLots");
    const contract = await ethers.getContractAt("MorningLightLots", MorningLightLots.address);

    const [signer] = await ethers.getSigners();
    const fortuneCount = await contract.getMyFortuneCount();

    if (fortuneCount === 0n) {
      console.log("📜 No fortunes drawn yet");
      return;
    }

    console.log(`📜 You have ${fortuneCount} fortune(s):\n`);
    
    for (let i = 0; i < Number(fortuneCount); i++) {
      const fortune = await contract.getMyFortune(i);
      console.log(`  Fortune #${i}: ${fortune} (encrypted)`);
    }
  });

task("task:getStatus")
  .setDescription("Get current drawing status")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const MorningLightLots = await deployments.get("MorningLightLots");
    const contract = await ethers.getContractAt("MorningLightLots", MorningLightLots.address);

    const [signer] = await ethers.getSigners();

    const fortuneCount = await contract.getMyFortuneCount();
    const lastDraw = await contract.getLastDrawTimestamp();
    const todayCount = await contract.getTodayDrawCount();
    const remaining = await contract.getRemainingCooldown();
    const canDraw = await contract.canDrawNow();

    console.log(`📊 Status for ${signer.address}:`);
    console.log(`   Total fortunes: ${fortuneCount}`);
    console.log(`   Today's draws: ${todayCount}/1`);
    console.log(`   Last draw: ${lastDraw === 0n ? "Never" : new Date(Number(lastDraw) * 1000).toISOString()}`);
    console.log(`   Cooldown: ${remaining > 0n ? `${remaining}s remaining` : "Ready"}`);
    console.log(`   Can draw now: ${canDraw ? "✅ Yes" : "❌ No"}`);
  });

