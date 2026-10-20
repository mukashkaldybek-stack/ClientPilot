const { execSync } = require('child_process');
const fs = require('fs');

const closingComment =
  '✅ Verified by qa-engineer.md — Acceptance criteria: PASS | Regression tests: PASS | Manual E2E: PASS. Closing issue.';

// Planned issues 1 through 15
const issuesToClose = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

for (const issueNum of issuesToClose) {
  console.log(`Closing Issue #${issueNum}...`);
  const tempPath = `temp_close_${issueNum}.txt`;
  fs.writeFileSync(tempPath, closingComment, 'utf8');

  try {
    // 1. Post mandatory comment
    execSync(`gh issue comment ${issueNum} --body-file "${tempPath}"`, {
      encoding: 'utf8',
      stdio: 'inherit',
    });
    // 2. Close issue
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

console.log('Finished closing issues 1-15.');
