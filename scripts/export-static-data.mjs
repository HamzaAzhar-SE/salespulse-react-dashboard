// Copies the fake data from mock/db.json into public/data/*.json.
// Runs automatically before "npm run build", so the deployed site has data without a server.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const db = JSON.parse(readFileSync('mock/db.json', 'utf8'));
mkdirSync('public/data', { recursive: true });

for (const name of ['orders', 'customers']) {
  writeFileSync(`public/data/${name}.json`, JSON.stringify(db[name]));
  console.log(`public/data/${name}.json  (${db[name].length} items)`);
}
