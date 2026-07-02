const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../../config/aws-config");

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    await fs.access(repoPath);
  } catch {
    console.error("❌ Not a git repository. Run `init` first.");
    return;
  }

  if (!process.env.S3_BUCKET) {
    console.error("❌ S3_BUCKET not configured in environment.");
    return;
  }

  try {
    const commitDirs = await fs.readdir(commitsPath);

    if (commitDirs.length === 0) {
      console.log("⚠️  No commits to push.");
      return;
    }

    let pushedCount = 0;
    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const stat = await fs.stat(commitPath);
      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(commitPath);

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        await s3
          .upload({
            Bucket: S3_BUCKET,
            Key: `commits/${commitDir}/${file}`,
            Body: fileContent,
          })
          .promise();
      }
      pushedCount++;
    }

    console.log(`✅ Pushed ${pushedCount} commit(s) to S3 (${S3_BUCKET}).`);
  } catch (err) {
    console.error("❌ Error pushing to S3:", err.message);
  }
}

module.exports = { pushRepo };
