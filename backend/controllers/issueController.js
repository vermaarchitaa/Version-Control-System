const Issue = require("../models/issueModel");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");

async function createIssue(req, res) {
  const { title, description, labels, assignees } = req.body;
  const { id } = req.params; // repo ID
  const userId = req.user.id;

  if (!title) return res.status(400).json({ error: "Issue title is required." });

  try {
    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });

    const user = await User.findById(userId);

    const issue = new Issue({
      title,
      description: description || "",
      repository: id,
      author: userId,
      authorName: user.username,
      labels: labels || [],
      assignees: assignees || [],
    });

    await issue.save();

    // Add issue ref to repo
    repo.issues.push(issue._id);
    await repo.save();

    // Notify via socket
    const io = req.app.get("io");
    if (io) {
      io.to(`repo:${id}`).emit("newIssue", issue);
    }

    res.status(201).json(issue);
  } catch (err) {
    console.error("Create issue error:", err.message);
    res.status(500).json({ error: "Failed to create issue." });
  }
}

async function getAllIssues(req, res) {
  const { id } = req.params; // repo ID
  const { status, label, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const query = { repository: id };
    if (status) query.status = status;
    if (label) query.labels = label;

    const issues = await Issue.find(query)
      .populate("author", "username avatarUrl")
      .populate("assignees", "username avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Issue.countDocuments(query);

    res.json({ issues, total });
  } catch (err) {
    console.error("Get issues error:", err.message);
    res.status(500).json({ error: "Failed to fetch issues." });
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id)
      .populate("author", "username avatarUrl")
      .populate("assignees", "username avatarUrl")
      .populate("comments.author", "username avatarUrl");

    if (!issue) return res.status(404).json({ error: "Issue not found." });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch issue." });
  }
}

async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status, labels, assignees } = req.body;

  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found." });

    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (labels !== undefined) issue.labels = labels;
    if (assignees !== undefined) issue.assignees = assignees;

    if (status !== undefined && status !== issue.status) {
      issue.status = status;
      if (status === "closed") issue.closedAt = new Date();
      else issue.closedAt = null;
    }

    await issue.save();
    res.json({ message: "Issue updated.", issue });
  } catch (err) {
    res.status(500).json({ error: "Failed to update issue." });
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) return res.status(404).json({ error: "Issue not found." });

    // Remove from repo
    await Repository.findByIdAndUpdate(issue.repository, {
      $pull: { issues: id },
    });

    res.json({ message: "Issue deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete issue." });
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────
async function addComment(req, res) {
  const { id } = req.params; // issue ID
  const { body } = req.body;
  const userId = req.user.id;

  if (!body) return res.status(400).json({ error: "Comment body is required." });

  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found." });

    const user = await User.findById(userId);
    issue.comments.push({ author: userId, authorName: user.username, body });
    await issue.save();

    const io = req.app.get("io");
    if (io) io.to(`repo:${issue.repository}`).emit("newComment", { issueId: id });

    res.status(201).json({ message: "Comment added.", comments: issue.comments });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment." });
  }
}

async function deleteComment(req, res) {
  const { id, commentId } = req.params;
  const userId = req.user.id;

  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found." });

    const comment = issue.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found." });

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this comment." });
    }

    issue.comments.pull(commentId);
    await issue.save();
    res.json({ message: "Comment deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment." });
  }
}

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueById,
  deleteIssueById,
  addComment,
  deleteComment,
};
