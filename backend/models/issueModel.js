const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const IssueSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    authorName: {
      type: String,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    labels: [
      {
        type: String,
        enum: ["bug", "enhancement", "documentation", "help wanted", "question", "wontfix", "duplicate"],
      },
    ],
    comments: [CommentSchema],
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Issue = mongoose.model("Issue", IssueSchema);
module.exports = Issue;
