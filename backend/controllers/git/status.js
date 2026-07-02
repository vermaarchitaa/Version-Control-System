const fs = require("fs").promises;
const path = require("path");

async function statusRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.access(repoPath);
  } catch {
    console.error("❌ Not a git repository. Run `init` first.");
    return;
  }

  try {
    let branch = "main";
    try {
      const config = JSON.parse(
        await fs.readFile(path.join(repoPath, "config.json"), "utf8")
      );
      branch = config.branch || "main";
    } catch {
      /* ignore */
    }

    console.log(`\n📁 On branch: ${branch}`);

    let stagedFiles = [];
    try {
      stagedFiles = await fs.readdir(stagingPath);
    } catch {
      /* staging might not exist */
    }

    if (stagedFiles.length === 0) {
      console.log("\nNothing staged for commit.");
      console.log('Use `add <file>` or `add .` to stage files.');
    } else {
      console.log(`\nChanges staged for commit (${stagedFiles.length}):`);
      stagedFiles.forEach((f) => console.log(`  ✅  ${f}`));
    }

    // Show commits count
    let log = [];
    try {
      log = JSON.parse(
        await fs.readFile(path.join(repoPath, "commit.log"), "utf8")
      );
    } catch {
      /* no log yet */
    }

    console.log(`\nTotal commits: ${log.length}`);
    if (log.length > 0) {
      const latest = log[0];
      console.log(
        `Latest commit: ${latest.commitID.slice(0, 8)} - "${latest.message}"`
      );
    }
    console.log();
  } catch (err) {
    console.error("❌ Error checking status:", err.message);
  }
}

module.exports = { statusRepo };
