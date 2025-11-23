# Morning Light Lots 🌅

A fully homomorphic encryption (FHE) powered daily fortune drawing dApp built on FHEVM. Draw your encrypted fortune daily, decrypt it after cooldown, and discover your personalized guidance for the day.

## ✨ Features

- 🔐 **Fully Encrypted Fortunes**: All fortune numbers are encrypted on-chain using FHEVM
- 🎲 **Daily Drawing System**: One fortune per day with cooldown mechanism
- 🔓 **User-Controlled Decryption**: Only you can decrypt your own fortune using EIP-712 signatures
- 📱 **Modern UI**: Beautiful, responsive interface with animations and glassmorphism design
- 🔄 **Dual Mode Support**: 
  - **Mock Mode**: Local development with instant feedback
  - **Production Mode**: Real blockchain transactions on Sepolia testnet
- 💼 **Wallet Integration**: Seamless MetaMask/EIP-6963 wallet connection with silent reconnection
- 📊 **History Tracking**: View all your past fortunes with decrypted results
- 🎨 **Design Tokens**: Deterministic design system based on project parameters

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.24
- **FHEVM** v0.9.1 - Fully Homomorphic Encryption Virtual Machine
- **Hardhat** - Development framework
- **Ethers.js** v6 - Ethereum interaction library

### Frontend
- **Next.js** 15 - React framework with static export
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **@zama-fhe/relayer-sdk** v0.3.0-5 - FHEVM Relayer SDK
- **@fhevm/mock-utils** v0.3.0-1 - Local FHEVM mock utilities

## 📁 Project Structure

```
zama_MorningLight_Lots/
├── fhevm-hardhat-template/          # Smart contract development
│   ├── contracts/
│   │   ├── MorningLightLots.sol     # Main fortune drawing contract
│   │   └── FHECounter.sol           # Reference contract
│   ├── deploy/                       # Deployment scripts
│   ├── test/                         # Contract tests
│   ├── tasks/                        # Hardhat custom tasks
│   └── types/                        # TypeScript type definitions
│
└── morninglight-lots-frontend/       # Next.js frontend application
    ├── app/                          # Next.js app router pages
    │   ├── page.tsx                  # Home page
    │   ├── draw/                     # Fortune drawing page
    │   ├── history/                  # Fortune history page
    │   └── settings/                 # Settings page
    ├── components/                   # React components
    ├── fhevm/                        # FHEVM integration layer
    ├── hooks/                        # Custom React hooks
    ├── abi/                          # Contract ABIs (auto-generated)
    └── scripts/                      # Build and ABI generation scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20
- **npm** >= 7.0.0
- **MetaMask** or compatible Web3 wallet
- (Optional) **Infura API Key** for Sepolia testnet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OctaviaPaul/zama_MorningLight_Lots.git
   cd zama_MorningLight_Lots
   ```

2. **Install contract dependencies**
   ```bash
   cd fhevm-hardhat-template
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../morninglight-lots-frontend
   npm install
   ```

4. **Set up environment variables** (for contract deployment)
   ```bash
   cd ../fhevm-hardhat-template
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   ```

5. **Set up frontend environment** (for production mode)
   ```bash
   cd ../morninglight-lots-frontend
   # Create .env.local
   echo "NEXT_PUBLIC_INFURA_KEY=your_infura_key_here" > .env.local
   ```

## 🎮 Development Modes

### Mock Mode (Local Development)

Perfect for development and testing without real transactions:

```bash
# Terminal 1: Start Hardhat node
cd fhevm-hardhat-template
npx hardhat node

# Terminal 2: Deploy contract to local network
npx hardhat deploy --network localhost

# Terminal 3: Start frontend in mock mode
cd morninglight-lots-frontend
npm run dev:mock
```

**Features:**
- ✅ Automatic Hardhat node detection
- ✅ Auto-generated ABI files
- ✅ Instant transaction feedback
- ✅ No real gas costs
- ✅ Uses `@fhevm/mock-utils` for FHEVM operations

### Production Mode (Sepolia Testnet)

For testing on real blockchain:

```bash
# Deploy contract to Sepolia
cd fhevm-hardhat-template
npx hardhat deploy --network sepolia

# Start frontend in production mode
cd morninglight-lots-frontend
npm run dev
```

**Requirements:**
- Contract deployed to Sepolia
- Wallet with Sepolia testnet ETH
- Infura API key configured
- FHEVM addresses configured (see [Configuration Guide](morninglight-lots-frontend/CONFIGURATION.md))

## 📝 Available Scripts

### Contract (fhevm-hardhat-template)

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile all contracts |
| `npm run test` | Run contract tests |
| `npm run deploy` | Deploy contracts to network |
| `npm run lint` | Run linting checks |
| `npm run clean` | Clean build artifacts |

### Frontend (morninglight-lots-frontend)

| Script | Description |
|--------|-------------|
| `npm run dev:mock` | Start dev server with mock FHEVM |
| `npm run dev` | Start dev server with real Relayer SDK |
| `npm run build` | Build for production (static export) |
| `npm run check:static` | Verify static export compatibility |
| `npm run lint` | Run ESLint |

## 🎯 How It Works

1. **Connect Wallet**: User connects their MetaMask wallet
2. **Draw Fortune**: User draws an encrypted fortune (1-64) stored on-chain
3. **Cooldown Period**: 5 seconds cooldown (120 seconds in production)
4. **Decrypt**: User decrypts their fortune using EIP-712 signature
5. **View History**: All past fortunes are stored and can be viewed

### Encryption Flow

```
User Draws Fortune
    ↓
Contract generates encrypted euint16 (1-64)
    ↓
Fortune stored on-chain (encrypted)
    ↓
FHE.allow() grants decryption permission
    ↓
User signs EIP-712 message
    ↓
userDecrypt() decrypts using Relayer SDK
    ↓
Fortune revealed (number + personalized message)
```

## 🔧 Configuration

See [CONFIGURATION.md](morninglight-lots-frontend/CONFIGURATION.md) for detailed configuration instructions, including:
- Environment variables setup
- FHEVM network addresses
- Contract deployment
- ABI generation

## 🧪 Testing

### Contract Tests

```bash
cd fhevm-hardhat-template
npm run test                    # Local tests
npm run test -- --network sepolia  # Sepolia tests
```

### Frontend Static Export Check

```bash
cd morninglight-lots-frontend
npm run check:static
```

## 📦 Deployment

### Contract Deployment

**Local Network:**
```bash
npx hardhat deploy --network localhost
```

**Sepolia Testnet:**
```bash
npx hardhat deploy --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Frontend Deployment

The frontend is configured for static export and can be deployed to any static hosting service:

**Vercel:**
```bash
cd morninglight-lots-frontend
npx vercel --prod
```

**Other Static Hosts:**
```bash
npm run build
# Deploy the 'out' directory
```

## 🎨 Design System

The project uses a deterministic design token system based on:
- Project name: "Morning Light Lots"
- Target network: "Sepolia"
- Year/Month: "202511"
- Contract name: "MorningLightLots"

Design tokens are generated via SHA-256 hash and include:
- Color palette (light/dark modes)
- Typography scales
- Spacing system
- Component styles
- Animations

See `morninglight-lots-frontend/lib/design-tokens.ts` for details.

## 🔐 Security Considerations

- **Private Keys**: Never commit private keys or mnemonics
- **Decryption Signatures**: Stored locally in browser, never transmitted
- **FHEVM Authorization**: Each fortune requires explicit `FHE.allow()` call
- **Wallet Connection**: Uses EIP-6963 for secure wallet detection
- **Static Export**: No server-side code, reducing attack surface

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [Configuration Guide](morninglight-lots-frontend/CONFIGURATION.md)
- [Contract README](fhevm-hardhat-template/README.md)

## 🤝 Contributing

This project was developed as a collaborative effort. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👥 Contributors

- **OctaviaPaul** - Main development and architecture
- **SohamDuttae** - UI/UX and frontend integration

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See [LICENSE](fhevm-hardhat-template/LICENSE) for details.

## 🙏 Acknowledgments

- **Zama** for the FHEVM protocol and excellent documentation
- **FHEVM Community** for support and feedback
- Built with ❤️ using FHEVM v0.9

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/OctaviaPaul/zama_MorningLight_Lots/issues)
- **FHEVM Documentation**: [docs.zama.ai](https://docs.zama.ai/fhevm)
- **Zama Discord**: [Join the community](https://discord.gg/zama)

---

**Live Demo**: [Vercel Deployment](https://ml-lots-6332d0db-5c9swprbt-galaxys-projects-2b1b20e2.vercel.app)

**Contract Address (Sepolia)**: `0x563Eb3c80320Ee04E46BC23862C0d1F17189596B`

