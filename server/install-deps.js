
import { execSync } from 'child_process';
import fs from 'fs';

const requiredDeps = [
  '@clerk/clerk-sdk-node',
  'helmet',
  'express-validator',
  'express-rate-limit',
  'express',
  'cors',
  'mongoose',
  'dotenv',
  'stripe'
];

console.log('🔍 Checking server dependencies...');

const packageJsonPath = './package.json';
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('❌ Could not read package.json');
  process.exit(1);
}

const installedDeps = {
  ...packageJson.dependencies || {},
  ...packageJson.devDependencies || {}
};

const missingDeps = requiredDeps.filter(dep => !installedDeps[dep]);

if (missingDeps.length > 0) {
  console.log(`📦 Installing missing dependencies: ${missingDeps.join(', ')}`);
  try {
    execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ All dependencies are already installed');
}
