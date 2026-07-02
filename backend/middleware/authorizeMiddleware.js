const Repository = require("../models/repoModel");

/**
 * Middleware to check if the current user owns the repository.
 * Expects req.user to be set by authMiddleware, and req.params.id to be the repo ID.
 */
const authorizeRepoOwner = async (req, res, next) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({ error: "Repository not found." });
    }

    if (repo.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You do not own this repository." });
    }

    req.repo = repo; // attach for controller use
    next();
  } catch (err) {
    res.status(500).json({ error: "Authorization check failed.", details: err.message });
  }
};

/**
 * Middleware to check if the requesting user matches the profile being modified.
 * Expects req.params.id to be the user ID.
 */
const authorizeSelf = (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Access denied. You can only modify your own profile." });
  }
  next();
};

module.exports = { authorizeRepoOwner, authorizeSelf };
