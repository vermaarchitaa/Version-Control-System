const fs = require("fs").promises;
const path = require("path");

async function logRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");

  try {
    await fs.access(repoPath);
  } catch {
    console.error("❌ Not a git repository. Run `init` first.");
    return;
  }

  try {
    const logPath = path.join(repoPath, "commit.log");
    const log = JSON.parse(await fs.readFile(logPath, "utf8"));

    if (!log.length) {
      console.log("No commits yet.");
      return;
    }

    console.log(`\n📋 Commit History (${log.length} commits):\n`);
    log.forEach((commit, i) => {
      const date = new Date(commit.date).toLocaleString();
      console.log(`${i === 0 ? "HEAD →" : "       "} commit ${commit.commitID}`);
      console.log(`   Branch:  ${commit.branch}`);
      console.log(`   Date:    ${date}`);
      console.log(`   Message: ${commit.message}`);
      console.log(`   Files:   ${commit.files.join(", ")}`);
      console.log();
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("No commit log found. Make a commit first.");
    } else {
      console.error("❌ Error reading log:", err.message);
    }
  }
}

module.exports = { logRepo };
