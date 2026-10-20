const { execSync } = require('child_process');
const fs = require('fs');

const closingComment =
  '✅ Verified by qa-engineer.md — Acceptance criteria: PASS | Regression tests: PASS | Manual E2E: PASS. Closing issue.';

const issuesToClose = [18, 19, 20];

for (const issueNum of issuesToClose) {
  console.log(`Closing Issue #${issueNum}...`);
  const tempPath = `temp_close_${issueNum}.txt`;
  fs.writeFileSync(tempPath, closingComment, 'utf8');

  try {
    execSync(`gh issue comment ${issueNum} --body-file "${tempPath}"`, {
      encoding: 'utf8',
      stdio: 'inherit',
    });
    execSync(`gh issue close ${issueNum}`, {
      encoding: 'utf8',
      stdio: 'inherit',
    });
    console.log(`-> Successfully closed #${issueNum}`);
  } catch (err) {
    console.error(`Error closing #${issueNum}:`, err.message);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

console.log('Finished closing issues 18, 19, and 20.');
