const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    await fs.access(repoPath);
  } catch {
    console.error("❌ Not a git repository. Run `init` first.");
    return;
  }

  if (!message || message.trim() === "") {
    console.error("❌ Commit message is required.");
    return;
  }

  try {
    const stagedFiles = await fs.readdir(stagedPath);

    if (stagedFiles.length === 0) {
      console.log("⚠️  Nothing to commit. Stage files first with `add <file>`.");
      return;
    }

    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    const copiedFiles = [];
    for (const file of stagedFiles) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
      copiedFiles.push(file);
    }

    // Read config for branch info
    let branch = "main";
    try {
      const config = JSON.parse(
        await fs.readFile(path.join(repoPath, "config.json"), "utf8")
      );
      branch = config.branch || "main";
    } catch {
      /* ignore */
    }

    const commitMeta = {
      commitID,
      message: message.trim(),
      date: new Date().toISOString(),
      branch,
      files: copiedFiles,
    };

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify(commitMeta, null, 2)
    );

    // Clear staging area
    for (const file of stagedFiles) {
      await fs.unlink(path.join(stagedPath, file));
    }

    // Update commit log
    const logPath = path.join(repoPath, "commit.log");
    let log = [];
    try {
      log = JSON.parse(await fs.readFile(logPath, "utf8"));
    } catch {
      /* no log yet */
    }
    log.unshift(commitMeta);
    await fs.writeFile(logPath, JSON.stringify(log, null, 2));

    console.log(`✅ Commit created: ${commitID.slice(0, 8)}`);
    console.log(`   Message: "${message}"`);
    console.log(`   Files: ${copiedFiles.join(", ")}`);
  } catch (err) {
    console.error("❌ Error committing:", err.message);
  }
}

module.exports = { commitRepo };
