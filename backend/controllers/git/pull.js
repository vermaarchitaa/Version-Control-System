const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../../config/aws-config");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    await fs.access(repoPath);
  } catch {
    console.error("❌ Not a git repository. Run `init` first.");
    return;
  }

  try {
    const data = await s3
      .listObjectsV2({ Bucket: S3_BUCKET, Prefix: "commits/" })
      .promise();

    if (!data.Contents || data.Contents.length === 0) {
      console.log("⚠️  No commits found on remote.");
      return;
    }

    for (const object of data.Contents) {
      const key = object.Key;
      const parts = key.split("/");
      const commitId = parts[1];
      const fileName = parts[2];

      if (!commitId || !fileName) continue;

      const commitDir = path.join(commitsPath, commitId);
      await fs.mkdir(commitDir, { recursive: true });

      const fileContent = await s3.getObject({ Bucket: S3_BUCKET, Key: key }).promise();
      await fs.writeFile(path.join(commitDir, fileName), fileContent.Body);
    }

    console.log(`✅ Pulled ${data.Contents.length} objects from S3.`);
  } catch (err) {
    console.error("❌ Error pulling from S3:", err.message);
  }
}

module.exports = { pullRepo };
