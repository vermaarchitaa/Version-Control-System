const fs = require("fs").promises;
const path = require("path");

async function revertRepo(commitID) {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    await fs.access(repoPath);
  } catch {
    console.error("❌ Not a git repository. Run `init` first.");
    return;
  }

  try {
    const commitDir = path.join(commitsPath, commitID);
    await fs.access(commitDir);

    const files = await fs.readdir(commitDir);
    const parentDir = path.resolve(repoPath, "..");
    const restoredFiles = [];

    for (const file of files) {
      if (file === "commit.json") continue; // skip meta
      await fs.copyFile(path.join(commitDir, file), path.join(parentDir, file));
      restoredFiles.push(file);
    }

    console.log(`✅ Reverted to commit: ${commitID.slice(0, 8)}`);
    console.log(`   Restored: ${restoredFiles.join(", ")}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`❌ Commit not found: ${commitID}`);
    } else {
      console.error("❌ Error reverting:", err.message);
    }
  }
}

module.exports = { revertRepo };
