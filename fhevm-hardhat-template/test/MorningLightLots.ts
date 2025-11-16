import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { MorningLightLots } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// import { createInstance } from "../tasks/utils"; // Temporarily commented for v0.9 upgrade

describe("MorningLightLots", function () {
  let contract: MorningLightLots;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  before(async function () {
    [owner, user1, user2] = await ethers.getSigners();
  });

  beforeEach(async function () {
    await deployments.fixture(["MorningLightLots"]);
    const MorningLightLotsDeployment = await deployments.get("MorningLightLots");
    contract = await ethers.getContractAt("MorningLightLots", MorningLightLotsDeployment.address);
  });

  describe("Deployment", function () {
    it("Should deploy with correct constants", async function () {
      expect(await contract.COOLDOWN_SECONDS()).to.equal(5); // Updated to 5 for testing
      expect(await contract.DAILY_LIMIT()).to.equal(1);
      expect(await contract.FORTUNE_COUNT()).to.equal(64);
    });

    it("Should initialize with zero fortunes for new user", async function () {
      expect(await contract.connect(user1).getMyFortuneCount()).to.equal(0);
    });
  });

  describe("Drawing Fortune", function () {
    it("Should allow first fortune draw", async function () {
      const canDraw = await contract.connect(user1).canDrawNow();
      expect(canDraw).to.be.true;

      const tx = await contract.connect(user1).drawFortune();
      await tx.wait();

      expect(await contract.connect(user1).getMyFortuneCount()).to.equal(1);
    });

    it("Should emit FortuneDrawn event", async function () {
      await expect(contract.connect(user1).drawFortune())
        .to.emit(contract, "FortuneDrawn")
        .withArgs(user1.address, 0, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1), await ethers.provider.getBlock("latest").then(b => Math.floor((b!.timestamp + 1) / 86400)));
    });

    it("Should enforce cooldown period", async function () {
      // First draw
      await contract.connect(user1).drawFortune();
      
      // Try to draw immediately - should fail
      await expect(contract.connect(user1).drawFortune())
        .to.be.revertedWith("Cooldown period not finished");
      
      // Check remaining cooldown
      const remaining = await contract.connect(user1).getRemainingCooldown();
      expect(remaining).to.be.gt(0);
    });

    it("Should enforce daily limit", async function () {
      // First draw
      await contract.connect(user1).drawFortune();
      
      // Fast forward past cooldown
      await ethers.provider.send("evm_increaseTime", [6]); // COOLDOWN_SECONDS is now 5
      await ethers.provider.send("evm_mine", []);
      
      // Try to draw again same day - should fail (daily limit = 1)
      await expect(contract.connect(user1).drawFortune())
        .to.be.revertedWith("Daily draw limit reached");
    });

    it("Should allow drawing after day resets", async function () {
      // First draw
      await contract.connect(user1).drawFortune();
      
      // Fast forward past cooldown AND to next day
      await ethers.provider.send("evm_increaseTime", [86401]); // 1 day + 1 second
      await ethers.provider.send("evm_mine", []);
      
      // Should be able to draw again
      const canDraw = await contract.connect(user1).canDrawNow();
      expect(canDraw).to.be.true;
      
      await contract.connect(user1).drawFortune();
      expect(await contract.connect(user1).getMyFortuneCount()).to.equal(2);
    });

    it("Should isolate fortunes between users", async function () {
      await contract.connect(user1).drawFortune();
      await contract.connect(user2).drawFortune();

      expect(await contract.connect(user1).getMyFortuneCount()).to.equal(1);
      expect(await contract.connect(user2).getMyFortuneCount()).to.equal(1);
    });
  });

  describe("Retrieving Fortunes", function () {
    beforeEach(async function () {
      await contract.connect(user1).drawFortune();
    });

    it("Should retrieve encrypted fortune", async function () {
      const fortune = await contract.connect(user1).getMyFortune(0);
      // Fortune is encrypted, we can't check the value directly
      // But we can verify it returns something
      expect(fortune).to.not.be.undefined;
    });

    it("Should revert when accessing invalid fortune index", async function () {
      await expect(contract.connect(user1).getMyFortune(999))
        .to.be.revertedWith("Invalid fortune index");
    });

    it("Should return correct fortune count", async function () {
      expect(await contract.connect(user1).getMyFortuneCount()).to.equal(1);
      
      // Fast forward to next day and draw again
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);
      
      await contract.connect(user1).drawFortune();
      expect(await contract.connect(user1).getMyFortuneCount()).to.equal(2);
    });
  });

  // Temporarily disabled for v0.9 upgrade - needs createInstance update
  describe.skip("Decryption (Manual Test)", function () {
    it("Should allow decryption of fortune number", async function () {
      // Draw fortune
      await contract.connect(user1).drawFortune();
      
      // Get encrypted fortune
      const encryptedFortune = await contract.connect(user1).getMyFortune(0);
      
      // TODO: Update createInstance for v0.9 API
      // const instance = await createInstance();
      
      // Decryption test skipped - requires createInstance update for v0.9
      console.log("Decryption test temporarily skipped (v0.9 upgrade)");
    });
  });

  describe("Status Checks", function () {
    it("Should return correct lastDrawTimestamp", async function () {
      expect(await contract.connect(user1).getLastDrawTimestamp()).to.equal(0);
      
      await contract.connect(user1).drawFortune();
      const timestamp = await contract.connect(user1).getLastDrawTimestamp();
      expect(timestamp).to.be.gt(0);
    });

    it("Should return correct todayDrawCount", async function () {
      expect(await contract.connect(user1).getTodayDrawCount()).to.equal(0);
      
      await contract.connect(user1).drawFortune();
      expect(await contract.connect(user1).getTodayDrawCount()).to.equal(1);
    });

    it("Should return correct canDrawNow status", async function () {
      expect(await contract.connect(user1).canDrawNow()).to.be.true;
      
      await contract.connect(user1).drawFortune();
      expect(await contract.connect(user1).canDrawNow()).to.be.false;
      
      // Fast forward to next day
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);
      
      expect(await contract.connect(user1).canDrawNow()).to.be.true;
    });
  });
});

