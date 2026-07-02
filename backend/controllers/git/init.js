const fs = require("fs").promises;
const path = require("path");

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");
  const stagingPath = path.join(repoPath, "staging");

  try {
    // Check if already initialized
    try {
      await fs.access(repoPath);
      console.log("Repository already initialised in this directory.");
      return;
    } catch {
      // doesn't exist, continue
    }

    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.mkdir(stagingPath, { recursive: true });

    const config = {
      bucket: process.env.S3_BUCKET || "",
      branch: "main",
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify(config, null, 2)
    );

    await fs.writeFile(path.join(repoPath, "HEAD"), "ref: refs/heads/main\n");

    console.log("✅ Repository initialised! (.apnaGit created)");
    console.log(`   Branch: main`);
  } catch (err) {
    console.error("❌ Error initialising repository:", err.message);
  }
}

module.exports = { initRepo };
