#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.resolve(__dirname, "..");
const APP_DIR = path.join(FRONTEND_DIR, "app");
const PAGES_DIR = path.join(FRONTEND_DIR, "pages");

const FORBIDDEN_PATTERNS = [
  // SSR/ISR
  { pattern: /getServerSideProps/g, name: "getServerSideProps (SSR)" },
  { pattern: /getStaticProps.*revalidate/g, name: "ISR (revalidate)" },
  { pattern: /export.*dynamic.*=.*['"]force-dynamic['"]/g, name: "dynamic='force-dynamic'" },
  
  // Server-only APIs
  { pattern: /from ['"]next\/headers['"]/g, name: "next/headers" },
  { pattern: /from ['"]server-only['"]/g, name: "server-only" },
  { pattern: /cookies\(\)/g, name: "cookies()" },
  { pattern: /headers\(\)/g, name: "headers()" },
  
  // API Routes (check for directories)
  // Will be checked separately
];

let errors = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(FRONTEND_DIR, filePath);

  for (const { pattern, name } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`${relativePath}: Found forbidden ${name}`);
    }
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Check for API route directories
      if (file === "api") {
        errors.push(`${path.relative(FRONTEND_DIR, fullPath)}: API routes directory found (not allowed for static export)`);
        continue;
      }
      
      // Check for dynamic segments without generateStaticParams
      if (file.startsWith("[") && file.endsWith("]")) {
        const parentDir = dir;
        const pageFile = path.join(parentDir, file, "page.tsx");
        
        if (fs.existsSync(pageFile)) {
          const content = fs.readFileSync(pageFile, "utf-8");
          if (!content.includes("generateStaticParams")) {
            errors.push(`${path.relative(FRONTEND_DIR, pageFile)}: Dynamic route without generateStaticParams`);
          }
        }
      }
      
      walkDir(fullPath);
    } else if (stat.isFile() && (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx"))) {
      checkFile(fullPath);
    }
  }
}

console.log("🔍 Checking for static export violations...\n");

// Check app directory
if (fs.existsSync(APP_DIR)) {
  walkDir(APP_DIR);
}

// Check pages directory
if (fs.existsSync(PAGES_DIR)) {
  walkDir(PAGES_DIR);
}

// Check next.config
const nextConfigPath = path.join(FRONTEND_DIR, "next.config.ts");
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, "utf-8");
  
  if (!configContent.includes('output: "export"') && !configContent.includes("output: 'export'")) {
    errors.push("next.config.ts: Missing output: 'export'");
  }
  
  if (!configContent.includes("unoptimized: true")) {
    errors.push("next.config.ts: Missing images.unoptimized: true");
  }
  
  if (!configContent.includes("trailingSlash: true")) {
    errors.push("next.config.ts: Missing trailingSlash: true");
  }
}

// Report results
if (errors.length === 0) {
  console.log("✅ No static export violations found!");
  console.log("   Safe to run: npm run build\n");
  process.exit(0);
} else {
  console.error("❌ Found static export violations:\n");
  errors.forEach((error) => {
    console.error(`   - ${error}`);
  });
  console.error("\nPlease fix these issues before building.\n");
  process.exit(1);
}

