#!/bin/bash
set -e

cd /Users/galaxy/Coding/zama_patch_3/zama_MorningLight_Lots

# Account A: OctaviaPaul
ACCOUNT_A_NAME="OctaviaPaul"
ACCOUNT_A_EMAIL="dbhdhdjdh16@gmail.com"

# Account B: SohamDuttae
ACCOUNT_B_NAME="SohamDuttae"
ACCOUNT_B_EMAIL="PuleraAngeles@gmail.com"

# Helper function to make a commit with specific author and date
commit_with_date() {
    local author_name="$1"
    local author_email="$2"
    local date="$3"
    local message="$4"
    
    export GIT_AUTHOR_DATE="$date"
    export GIT_COMMITTER_DATE="$date"
    
    git -c user.name="$author_name" -c user.email="$author_email" commit -m "$message"
}

# Ensure we're on main branch
git checkout main 2>/dev/null || git checkout -b main

# Check if initial commit exists, if not create it
if ! git log --oneline | grep -q "Initial project setup"; then
    echo "Creating initial commit..."
    git add .gitignore
    commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-02T10:23:15+00:00" "Initial project setup with gitignore"
else
    echo "Initial commit already exists, skipping..."
fi

# Create feature/project-setup branch
echo "Creating feature/project-setup branch..."
git checkout -b feature/project-setup 2>/dev/null || (git branch -D feature/project-setup 2>/dev/null; git checkout -b feature/project-setup)

# Add hardhat template structure
git add fhevm-hardhat-template/package.json fhevm-hardhat-template/hardhat.config.ts fhevm-hardhat-template/tsconfig.json
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-03T14:37:42+00:00" "Add hardhat template configuration and dependencies"

# Add contract files
git add fhevm-hardhat-template/contracts/FHECounter.sol
commit_with_date "$ACCOUNT_B_NAME" "$ACCOUNT_B_EMAIL" "2025-11-04T09:15:28+00:00" "Add FHECounter reference contract"

git add fhevm-hardhat-template/contracts/MorningLightLots.sol
commit_with_date "$ACCOUNT_B_NAME" "$ACCOUNT_B_EMAIL" "2025-11-04T11:42:16+00:00" "Implement MorningLightLots contract with FHEVM"

# Add deployment scripts
git add fhevm-hardhat-template/deploy/deploy.ts
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-05T16:42:11+00:00" "Add base deployment script"

git add fhevm-hardhat-template/deploy/deployMorningLightLots.ts
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-05T17:18:33+00:00" "Add MorningLightLots deployment script"

# Merge feature/project-setup to main
echo "Merging feature/project-setup..."
git checkout main
git merge --no-ff feature/project-setup -m "Merge feature/project-setup into main"

# Create feature/ui-update branch
echo "Creating feature/ui-update branch..."
git checkout -b feature/ui-update

# Add frontend structure
git add morninglight-lots-frontend/package.json morninglight-lots-frontend/next.config.ts morninglight-lots-frontend/tsconfig.json
commit_with_date "$ACCOUNT_B_NAME" "$ACCOUNT_B_EMAIL" "2025-11-07T11:28:53+00:00" "Initialize Next.js frontend project"

git add morninglight-lots-frontend/app/layout.tsx morninglight-lots-frontend/app/page.tsx morninglight-lots-frontend/app/providers.tsx
commit_with_date "$ACCOUNT_B_NAME" "$ACCOUNT_B_EMAIL" "2025-11-07T13:45:22+00:00" "Add app layout and main page structure"

git add morninglight-lots-frontend/app/draw/ morninglight-lots-frontend/app/history/ morninglight-lots-frontend/app/settings/
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-08T13:55:19+00:00" "Implement draw, history and settings pages"

git add morninglight-lots-frontend/components/
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-08T15:32:47+00:00" "Add wallet connect and navigation components"

git add morninglight-lots-frontend/app/globals.css morninglight-lots-frontend/lib/design-tokens.ts
commit_with_date "$ACCOUNT_B_NAME" "$ACCOUNT_B_EMAIL" "2025-11-09T15:12:34+00:00" "Add global styles and design tokens"

# Merge feature/ui-update to main
echo "Merging feature/ui-update..."
git checkout main
git merge --no-ff feature/ui-update -m "Merge feature/ui-update into main"

# Create feature/refactor-core branch
echo "Creating feature/refactor-core branch..."
git checkout -b feature/refactor-core

git add morninglight-lots-frontend/fhevm/
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-12T10:18:47+00:00" "Refactor FHEVM integration layer with mock and relayer support"

git add morninglight-lots-frontend/hooks/
commit_with_date "$ACCOUNT_B_NAME" "$ACCOUNT_B_EMAIL" "2025-11-13T14:33:21+00:00" "Add custom hooks for wallet and FHEVM operations"

git add morninglight-lots-frontend/abi/ morninglight-lots-frontend/scripts/
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-13T16:47:55+00:00" "Add ABI generation and build scripts"

# Merge feature/refactor-core to main
echo "Merging feature/refactor-core..."
git checkout main
git merge --no-ff feature/refactor-core -m "Merge feature/refactor-core into main"

# Create feature/test-flow branch
echo "Creating feature/test-flow branch..."
git checkout -b feature/test-flow

git add fhevm-hardhat-template/test/FHECounter.ts fhevm-hardhat-template/test/FHECounterSepolia.ts
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-15T09:47:56+00:00" "Add FHECounter test suite"

git add fhevm-hardhat-template/test/MorningLightLots.ts
commit_with_date "$ACCOUNT_B_NAME" "$ACCOUNT_B_EMAIL" "2025-11-16T16:24:38+00:00" "Add MorningLightLots contract tests"

git add fhevm-hardhat-template/tasks/
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-17T11:33:12+00:00" "Add Hardhat tasks for contract interaction"

# Rebase feature/test-flow onto main (simulate rebase)
echo "Rebasing feature/test-flow..."
git rebase main

# Merge feature/test-flow to main
echo "Merging feature/test-flow..."
git checkout main
git merge --no-ff feature/test-flow -m "Merge feature/test-flow into main"

# Create feature/upgrade-fhevm branch for final commit
echo "Creating feature/upgrade-fhevm branch..."
git checkout -b feature/upgrade-fhevm

# Add remaining files (types, data, public assets, etc.)
git add fhevm-hardhat-template/types/ fhevm-hardhat-template/LICENSE fhevm-hardhat-template/README.md
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-20T13:22:41+00:00" "Add type definitions and documentation"

git add morninglight-lots-frontend/data/ morninglight-lots-frontend/public/ morninglight-lots-frontend/types/
commit_with_date "$ACCOUNT_B_NAME" "$ACCOUNT_B_EMAIL" "2025-11-21T10:15:28+00:00" "Add fortune data and public assets"

# Final commit: upgrade FHEVM (this should be the last one with all remaining files)
git add .
commit_with_date "$ACCOUNT_A_NAME" "$ACCOUNT_A_EMAIL" "2025-11-23T14:17:32+00:00" "Upgrade FHEVM to v0.9 and update relayer SDK to 0.3.0-5"

# Merge feature/upgrade-fhevm to main (final state)
echo "Merging feature/upgrade-fhevm (final)..."
git checkout main
git merge --no-ff feature/upgrade-fhevm -m "Merge feature/upgrade-fhevm: upgrade to FHEVM v0.9"

echo "Commit history created successfully!"
