#!/usr/bin/env node

import http from "http";

/**
 * Check if Hardhat node is running on localhost:8545
 */
function checkHardhatNode() {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 8545,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on("error", () => {
      resolve(false);
    });

    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    // Send a simple JSON-RPC request
    req.write(JSON.stringify({ jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 }));
    req.end();
  });
}

const isRunning = await checkHardhatNode();

if (!isRunning) {
  console.error("❌ Hardhat node is not running on localhost:8545");
  console.error("Please start it with: cd ../fhevm-hardhat-template && npx hardhat node");
  process.exit(1);
}

console.log("✅ Hardhat node is running");

