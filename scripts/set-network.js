const fs = require('fs');
const path = require('path');

const network = process.argv[2];
if (network !== 'mainnet' && network !== 'testnet') {
  console.error('Usage: node scripts/set-network.js <mainnet|testnet>');
  process.exit(1);
}

const target = path.join(__dirname, '..', 'src', 'config.ts');
const original = fs.readFileSync(target, 'utf8');
const pattern = /export const NETWORK = '(mainnet|testnet)' as 'mainnet' \| 'testnet';/;

if (!pattern.test(original)) {
  console.error('NETWORK declaration not found in src/config.ts');
  process.exit(1);
}

const updated = original.replace(
  pattern,
  `export const NETWORK = '${network}' as 'mainnet' | 'testnet';`
);
fs.writeFileSync(target, updated);
console.log(`config.ts NETWORK -> ${network}`);
