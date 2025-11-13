#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.resolve(__dirname, "..");
const CONTRACTS_DIR = path.resolve(FRONTEND_DIR, "../fhevm-hardhat-template");
const ABI_OUTPUT_DIR = path.join(FRONTEND_DIR, "abi");

// Determine which network to use
const isDevMock = process.env.npm_lifecycle_event === "dev:mock";
const network = isDevMock ? "localhost" : "sepolia";

console.log(`🔄 Generating ABI files for network: ${network}...`);

// Ensure ABI output directory exists
if (!fs.existsSync(ABI_OUTPUT_DIR)) {
  fs.mkdirSync(ABI_OUTPUT_DIR, { recursive: true });
}

// Path to deployments
const deploymentsPath = path.join(CONTRACTS_DIR, "deployments", network);

if (!fs.existsSync(deploymentsPath)) {
  console.warn(`⚠️  No deployments found for ${network} at ${deploymentsPath}`);
  console.warn("Using placeholder ABI...");
  
  // Create placeholder files
  const placeholderABI = `export const MorningLightLotsABI = [] as const;\n`;
  const placeholderAddresses = `export const MorningLightLotsAddresses = {
  31337: "0x0000000000000000000000000000000000000000" as const,
  11155111: "0x0000000000000000000000000000000000000000" as const,
} as const;\n`;
  
  fs.writeFileSync(path.join(ABI_OUTPUT_DIR, "MorningLightLotsABI.ts"), placeholderABI);
  fs.writeFileSync(path.join(ABI_OUTPUT_DIR, "MorningLightLotsAddresses.ts"), placeholderAddresses);
  
  console.log("✅ Placeholder ABI files created");
  process.exit(0);
}

// Read MorningLightLots deployment
const contractName = "MorningLightLots";
const deploymentFile = path.join(deploymentsPath, `${contractName}.json`);

if (!fs.existsSync(deploymentFile)) {
  console.error(`❌ Deployment file not found: ${deploymentFile}`);
  console.error(`Please deploy the contract first:`);
  console.error(`  cd fhevm-hardhat-template`);
  console.error(`  npx hardhat deploy --network ${network}`);
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));

// Generate ABI file
const abiContent = `// Auto-generated from deployments/${network}/${contractName}.json
// DO NOT EDIT MANUALLY

export const MorningLightLotsABI = ${JSON.stringify(deployment.abi, null, 2)} as const;
`;

fs.writeFileSync(path.join(ABI_OUTPUT_DIR, "MorningLightLotsABI.ts"), abiContent);

// Generate addresses file
const addressesContent = `// Auto-generated from deployments/${network}/${contractName}.json
// DO NOT EDIT MANUALLY

export const MorningLightLotsAddresses = {
  31337: "${network === "localhost" ? deployment.address : "0x0000000000000000000000000000000000000000"}" as const,
  11155111: "${network === "sepolia" ? deployment.address : "0x0000000000000000000000000000000000000000"}" as const,
} as const;
`;

fs.writeFileSync(path.join(ABI_OUTPUT_DIR, "MorningLightLotsAddresses.ts"), addressesContent);

console.log(`✅ ABI files generated successfully!`);
console.log(`   Contract: ${contractName}`);
console.log(`   Address: ${deployment.address}`);
console.log(`   Network: ${network} (chainId: ${deployment.chainId || "unknown"})`);

