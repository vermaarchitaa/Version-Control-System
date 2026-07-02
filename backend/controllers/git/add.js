const fs = require("fs").promises;
const path = require("path");

async function addRepo(filePath) {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const stagingPath = path.join(repoPath, "staging");

  // Check repo is initialized
  try {
    await fs.access(repoPath);
  } catch {
    console.error("❌ Not a git repository. Run `init` first.");
    return;
  }

  // Handle wildcard "."
  if (filePath === ".") {
    try {
      const allFiles = await fs.readdir(process.cwd());
      const filtered = allFiles.filter((f) => !f.startsWith(".") && f !== "node_modules");
      for (const f of filtered) {
        await stageSingleFile(path.join(process.cwd(), f), stagingPath);
      }
      console.log(`✅ All files added to staging area.`);
    } catch (err) {
      console.error("❌ Error adding all files:", err.message);
    }
    return;
  }

  await stageSingleFile(path.resolve(process.cwd(), filePath), stagingPath);
}

async function stageSingleFile(absolutePath, stagingPath) {
  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(absolutePath);
    await fs.copyFile(absolutePath, path.join(stagingPath, fileName));
    console.log(`✅ ${fileName} added to staging area.`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`❌ File not found: ${absolutePath}`);
    } else {
      console.error(`❌ Error staging file: ${err.message}`);
    }
  }
}

module.exports = { addRepo };
