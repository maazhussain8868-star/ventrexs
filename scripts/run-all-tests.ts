import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const scriptsDir = path.join(process.cwd(), 'scripts');
const files = fs.readdirSync(scriptsDir)
  .filter(f => f.startsWith('test-') && f.endsWith('.ts'))
  .sort();

console.log(`\n===============================================================`);
console.log(`  RUNNING ALL ${files.length} VENTREXS AI TEST SUITES`);
console.log(`===============================================================\n`);

let passedSuites = 0;
let failedSuites: string[] = [];

for (const file of files) {
  process.stdout.write(`• Executing ${file.padEnd(45)} ... `);
  try {
    execSync(`npx tsx scripts/${file}`, { stdio: 'pipe' });
    console.log('✅ PASS');
    passedSuites++;
  } catch (err: any) {
    console.log('❌ FAIL');
    failedSuites.push(file);
    if (err.stdout) console.log(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
  }
}

console.log(`\n===============================================================`);
console.log(`  TEST RUN COMPLETE: ${passedSuites} / ${files.length} SUITES PASSED`);
console.log(`===============================================================\n`);

if (failedSuites.length > 0) {
  console.error(`Failed suites: ${failedSuites.join(', ')}`);
  process.exit(1);
} else {
  console.log('🎉 ALL TEST SUITES PASSED WITH ZERO REGRESSIONS!');
  process.exit(0);
}
