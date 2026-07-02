const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");
const { v4: uuidv4 } = require("uuid");

// ─── CRUD ─────────────────────────────────────────────────────────────────────
async function createRepository(req, res) {
  const { name, description, visibility, topics, language, readme } = req.body;
  const owner = req.user.id;

  if (!name) {
    return res.status(400).json({ error: "Repository name is required." });
  }

  try {
    const existing = await Repository.findOne({ owner, name });
    if (existing) {
      return res.status(409).json({ error: "You already have a repository with this name." });
    }

    const newRepo = new Repository({
      name: name.trim().replace(/\s+/g, "-"),
      description: description || "",
      visibility: visibility || "public",
      owner,
      topics: topics || [],
      language: language || "",
      readme: readme || `# ${name}\n\nDescription goes here.`,
      branches: [{ name: "main", isDefault: true, createdBy: owner }],
      defaultBranch: "main",
      s3Prefix: `repos/${owner}/${uuidv4()}`,
    });

    await newRepo.save();

    // Add to user's repositories
    await User.findByIdAndUpdate(owner, {
      $push: { repositories: newRepo._id },
    });

    // Record contribution
    const today = new Date().toISOString().split("T")[0];
    const user = await User.findById(owner);
    user.contributions.set(today, (user.contributions.get(today) || 0) + 1);
    await user.save();

    await newRepo.populate("owner", "username avatarUrl");

    res.status(201).json({
      message: "Repository created!",
      repository: newRepo,
    });
  } catch (err) {
    console.error("Create repo error:", err.message);
    res.status(500).json({ error: "Failed to create repository." });
  }
}

async function getAllRepositories(req, res) {
  try {
    const { search, language, sort = "createdAt", page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { visibility: "public" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (language) query.language = language;

    const sortMap = {
      stars: { "stars.length": -1 },
      updated: { updatedAt: -1 },
      created: { createdAt: -1 },
    };

    const repositories = await Repository.find(query)
      .populate("owner", "username avatarUrl")
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Repository.countDocuments(query);

    res.json({ repositories, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error("Get all repos error:", err.message);
    res.status(500).json({ error: "Failed to fetch repositories." });
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById(id)
      .populate("owner", "username avatarUrl email")
      .populate("issues")
      .populate("stars", "username")
      .populate("forks", "name owner");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found." });
    }

    // If private, only owner can access
    if (
      repository.visibility === "private" &&
      req.user?.id !== repository.owner._id.toString()
    ) {
      return res.status(403).json({ error: "This repository is private." });
    }

    res.json(repository);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch repository." });
  }
}

async function fetchRepositoryByName(req, res) {
  const { username, name } = req.params;
  try {
    const owner = await User.findOne({ username });
    if (!owner) return res.status(404).json({ error: "User not found." });

    const repository = await Repository.findOne({ owner: owner._id, name })
      .populate("owner", "username avatarUrl")
      .populate("issues")
      .populate("stars", "username");

    if (!repository) return res.status(404).json({ error: "Repository not found." });

    if (
      repository.visibility === "private" &&
      req.user?.id !== repository.owner._id.toString()
    ) {
      return res.status(403).json({ error: "This repository is private." });
    }

    res.json(repository);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch repository." });
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;
  try {
    const repositories = await Repository.find({ owner: userID })
      .populate("owner", "username avatarUrl")
      .sort({ updatedAt: -1 });

    res.json({ repositories, total: repositories.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user repositories." });
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { description, visibility, topics, language, readme } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) return res.status(404).json({ error: "Repository not found." });

    if (description !== undefined) repository.description = description;
    if (visibility !== undefined) repository.visibility = visibility;
    if (topics !== undefined) repository.topics = topics;
    if (language !== undefined) repository.language = language;
    if (readme !== undefined) repository.readme = readme;

    const updated = await repository.save();
    res.json({ message: "Repository updated!", repository: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update repository." });
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repo = await Repository.findByIdAndDelete(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });

    // Remove from owner's list
    await User.findByIdAndUpdate(repo.owner, {
      $pull: { repositories: id },
    });

    // Delete all issues
    await Issue.deleteMany({ repository: id });

    res.json({ message: "Repository deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete repository." });
  }
}

// ─── Star / Unstar ────────────────────────────────────────────────────────────
async function toggleStar(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });

    const alreadyStarred = repo.stars.some((s) => s.toString() === userId);

    if (alreadyStarred) {
      repo.stars = repo.stars.filter((s) => s.toString() !== userId);
      await User.findByIdAndUpdate(userId, { $pull: { starredRepos: id } });
    } else {
      repo.stars.push(userId);
      await User.findByIdAndUpdate(userId, { $addToSet: { starredRepos: id } });
    }

    await repo.save();

    res.json({
      starred: !alreadyStarred,
      starCount: repo.stars.length,
      message: alreadyStarred ? "Unstarred." : "Starred.",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle star." });
  }
}

// ─── Fork ─────────────────────────────────────────────────────────────────────
async function forkRepository(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const original = await Repository.findById(id);
    if (!original) return res.status(404).json({ error: "Repository not found." });

    // Check already forked
    const alreadyForked = await Repository.findOne({ owner: userId, forkedFrom: id });
    if (alreadyForked) {
      return res.status(409).json({ error: "You already forked this repository." });
    }

    const fork = new Repository({
      name: original.name,
      description: original.description,
      visibility: original.visibility,
      owner: userId,
      files: original.files,
      branches: [{ name: "main", isDefault: true, createdBy: userId }],
      defaultBranch: "main",
      topics: original.topics,
      language: original.language,
      readme: original.readme,
      forkedFrom: original._id,
    });

    await fork.save();

    original.forks.push(fork._id);
    await original.save();

    await User.findByIdAndUpdate(userId, { $push: { repositories: fork._id } });

    await fork.populate("owner", "username avatarUrl");
    res.status(201).json({ message: "Repository forked!", repository: fork });
  } catch (err) {
    res.status(500).json({ error: "Failed to fork repository." });
  }
}

// ─── Branches ─────────────────────────────────────────────────────────────────
async function createBranch(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) return res.status(400).json({ error: "Branch name is required." });

  try {
    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });

    const exists = repo.branches.find((b) => b.name === name);
    if (exists) return res.status(409).json({ error: "Branch already exists." });

    repo.branches.push({ name, isDefault: false, createdBy: userId });
    await repo.save();

    res.status(201).json({ message: "Branch created!", branches: repo.branches });
  } catch (err) {
    res.status(500).json({ error: "Failed to create branch." });
  }
}

async function getBranches(req, res) {
  const { id } = req.params;
  try {
    const repo = await Repository.findById(id).select("branches defaultBranch");
    if (!repo) return res.status(404).json({ error: "Repository not found." });
    res.json({ branches: repo.branches, defaultBranch: repo.defaultBranch });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch branches." });
  }
}

// ─── File Management ──────────────────────────────────────────────────────────
async function getFiles(req, res) {
  const { id } = req.params;
  try {
    const repo = await Repository.findById(id).select("files readme");
    if (!repo) return res.status(404).json({ error: "Repository not found." });
    res.json({ files: repo.files, readme: repo.readme });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files." });
  }
}

async function uploadFile(req, res) {
  const { id } = req.params;
  const { name, path: filePath, content, commitMessage } = req.body;
  const userId = req.user.id;

  if (!name || !content) {
    return res.status(400).json({ error: "File name and content are required." });
  }

  try {
    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });

    const existingIndex = repo.files.findIndex((f) => f.path === (filePath || name));

    const fileEntry = {
      name,
      path: filePath || name,
      content,
      type: "file",
      size: Buffer.byteLength(content, "utf8"),
      lastCommitMessage: commitMessage || "Upload file",
    };

    if (existingIndex >= 0) {
      repo.files[existingIndex] = { ...repo.files[existingIndex].toObject(), ...fileEntry };
    } else {
      repo.files.push(fileEntry);
    }

    // Add commit
    const user = await User.findById(userId);
    const commitId = uuidv4();
    repo.commits.unshift({
      commitId,
      message: commitMessage || `Add ${name}`,
      author: userId,
      authorName: user.username,
      files: [name],
      branch: repo.defaultBranch,
    });

    // Keep only latest 100 commits in DB
    if (repo.commits.length > 100) repo.commits = repo.commits.slice(0, 100);

    await repo.save();

    // Update contribution
    const today = new Date().toISOString().split("T")[0];
    user.contributions.set(today, (user.contributions.get(today) || 0) + 1);
    await user.save();

    res.json({ message: "File uploaded!", file: fileEntry, commitId });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload file." });
  }
}

async function deleteFile(req, res) {
  const { id, filePath } = req.params;
  const { commitMessage } = req.body;
  const userId = req.user.id;

  try {
    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ error: "Repository not found." });

    const decodedPath = decodeURIComponent(filePath);
    const before = repo.files.length;
    repo.files = repo.files.filter((f) => f.path !== decodedPath);

    if (repo.files.length === before) {
      return res.status(404).json({ error: "File not found." });
    }

    const user = await User.findById(userId);
    repo.commits.unshift({
      commitId: uuidv4(),
      message: commitMessage || `Delete ${decodedPath}`,
      author: userId,
      authorName: user.username,
      files: [decodedPath],
      branch: repo.defaultBranch,
    });

    await repo.save();
    res.json({ message: "File deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file." });
  }
}

// ─── Commits ──────────────────────────────────────────────────────────────────
async function getCommits(req, res) {
  const { id } = req.params;
  const { branch, page = 1, limit = 20 } = req.query;

  try {
    const repo = await Repository.findById(id).select("commits defaultBranch");
    if (!repo) return res.status(404).json({ error: "Repository not found." });

    let commits = repo.commits;
    if (branch) commits = commits.filter((c) => c.branch === branch);

    const start = (page - 1) * limit;
    const paginated = commits.slice(start, start + parseInt(limit));

    res.json({ commits: paginated, total: commits.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch commits." });
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  deleteRepositoryById,
  toggleStar,
  forkRepository,
  createBranch,
  getBranches,
  getFiles,
  uploadFile,
  deleteFile,
  getCommits,
};
