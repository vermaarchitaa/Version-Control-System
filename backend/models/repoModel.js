const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommitSchema = new Schema(
  {
    commitId: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String },
    files: [{ type: String }],
    branch: { type: String, default: "main" },
  },
  { timestamps: true }
);

const BranchSchema = new Schema({
  name: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  isDefault: { type: Boolean, default: false },
  latestCommit: { type: String, default: "" },
});

const FileEntrySchema = new Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  content: { type: String, default: "" },
  type: { type: String, enum: ["file", "dir"], default: "file" },
  size: { type: Number, default: 0 },
  lastCommitMessage: { type: String, default: "" },
});

const RepositorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 350,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // File tree stored in DB (simple approach)
    files: [FileEntrySchema],
    // Branches
    branches: [BranchSchema],
    defaultBranch: {
      type: String,
      default: "main",
    },
    // Commit history
    commits: [CommitSchema],
    // Issues
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    // Stars
    stars: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Forks
    forks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Repository",
      },
    ],
    forkedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },
    // Topics/tags
    topics: [{ type: String }],
    // Language (primary)
    language: {
      type: String,
      default: "",
    },
    // README content
    readme: {
      type: String,
      default: "",
    },
    // S3 key prefix for actual file storage
    s3Prefix: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index: a user can't have two repos with the same name
RepositorySchema.index({ owner: 1, name: 1 }, { unique: true });

// Virtual: star count
RepositorySchema.virtual("starCount").get(function () {
  return this.stars.length;
});

// Virtual: fork count
RepositorySchema.virtual("forkCount").get(function () {
  return this.forks.length;
});

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;
