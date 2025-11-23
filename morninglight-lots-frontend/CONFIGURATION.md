# Configuration Guide

## ⚠️ Current Implementation Status

**✅ Fully Working**: Mock mode (local Hardhat development)
- Uses `@fhevm/mock-utils`
- No configuration required
- Instant feedback, no real transactions

**⚠️ Requires Configuration**: Relayer SDK mode (Sepolia production)
- Uses `@zama-fhe/relayer-sdk`  
- Needs FHEVM addresses and Infura API key
- **Implementation is placeholder** - needs actual SDK API documentation
- File: `fhevm/internal/fhevm.ts` line 35-60

## Required Configuration Before Deployment

### 1. Environment Variables

Create a `.env.local` file in the frontend root with:

```bash
# Infura API Key (for Sepolia network)
# Get your free API key at: https://infura.io/
NEXT_PUBLIC_INFURA_KEY=your_infura_api_key_here
```

**Note**: For local development (`dev:mock` mode), no environment variables are required.

### 2. FHEVM Network Addresses (Production Only)

**File**: `fhevm/internal/constants.ts`

For Sepolia testnet deployment, you MUST replace the placeholder addresses with actual FHEVM addresses:

```typescript
11155111: {
  chainId: 11155111,
  // Replace these with actual addresses from https://docs.zama.ai/fhevm
  aclAddress: "0x...",           // ACL contract address
  kmsVerifierAddress: "0x...",   // KMS Verifier address
  inputVerifierAddress: "0x...", // Input Verifier address
  decryptionOracleAddress: "0x...", // Decryption Oracle address
}
```

**Where to get addresses**:
- Official FHEVM docs: https://docs.zama.ai/fhevm
- Or deploy your own FHEVM infrastructure

**For local development**: Addresses are automatically fetched from Hardhat node via `fhevm_relayer_metadata` RPC call.

### 3. Contract Deployment

Before running the frontend, ensure the `MorningLightLots` contract is deployed:

**Local (Hardhat)**:
```bash
cd ../fhevm-hardhat-template
npx hardhat node  # Terminal 1
npx hardhat deploy --network localhost  # Terminal 2
```

**Sepolia**:
```bash
cd ../fhevm-hardhat-template
# Set up .env with MNEMONIC or PRIVATE_KEY and INFURA_API_KEY
npx hardhat deploy --network sepolia
```

### 4. Generate ABI Files

ABI files are generated automatically when running `dev:mock` or `dev` scripts, but you can also generate them manually:

```bash
npm run genabi  # Uses localhost network by default
```

## Development Modes

### Mock Mode (Local Hardhat)
```bash
npm run dev:mock
```
- Checks Hardhat node is running on localhost:8545
- Generates ABI from `../fhevm-hardhat-template/deployments/localhost/`
- Uses `@fhevm/mock-utils` for FHEVM operations
- No real transactions, instant feedback

### Production Mode (Sepolia or other networks)
```bash
npm run dev
```
- Generates ABI from `../fhevm-hardhat-template/deployments/sepolia/`
- Uses `@zama-fhe/relayer-sdk` for FHEVM operations
- Real blockchain transactions
- Requires wallet with test ETH

## Verification Checklist

Before deploying to production:

- [ ] Contract deployed to target network
- [ ] Environment variables configured (`.env.local`)
- [ ] FHEVM addresses updated in `constants.ts` (if using Sepolia)
- [ ] ABI files generated successfully
- [ ] `npm run check:static` passes
- [ ] `npm run build` completes successfully
- [ ] Manual testing of wallet connection
- [ ] Manual testing of draw → cooldown → decrypt flow
- [ ] Manual testing of silent wallet reconnection (page refresh)

## Troubleshooting

### "Contract not deployed" error
- Ensure contract is deployed to the network you're connecting to
- Check that ABI files exist in `abi/` directory
- Verify `MorningLightLotsAddresses` contains the correct address

### "Wrong Network" warning
- Contract is deployed to different network than wallet is connected to
- Switch network in MetaMask or deploy to current network

### FHEVM initialization failed
- Check FHEVM addresses in `constants.ts` are correct
- Verify Infura API key is valid (for Sepolia)
- For local mode, ensure Hardhat node is running with FHEVM plugin

### "Failed to decrypt" error
- Cooldown period (120s) must pass after drawing
- Wallet must be same account that drew the fortune
- Decryption signature must be generated (automatic on first use)

