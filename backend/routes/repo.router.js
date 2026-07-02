const express = require("express");
const repoController = require("../controllers/repoController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRepoOwner } = require("../middleware/authorizeMiddleware");

const repoRouter = express.Router();

// Public
repoRouter.get("/repos", repoController.getAllRepositories);
repoRouter.get("/repos/:id", repoController.fetchRepositoryById);
repoRouter.get("/repos/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/:username/:name", repoController.fetchRepositoryByName);

// Authenticated
repoRouter.post("/repos", authenticate, repoController.createRepository);
repoRouter.put("/repos/:id", authenticate, authorizeRepoOwner, repoController.updateRepositoryById);
repoRouter.delete("/repos/:id", authenticate, authorizeRepoOwner, repoController.deleteRepositoryById);

// Star
repoRouter.post("/repos/:id/star", authenticate, repoController.toggleStar);

// Fork
repoRouter.post("/repos/:id/fork", authenticate, repoController.forkRepository);

// Branches
repoRouter.get("/repos/:id/branches", repoController.getBranches);
repoRouter.post("/repos/:id/branches", authenticate, repoController.createBranch);

// Files
repoRouter.get("/repos/:id/files", repoController.getFiles);
repoRouter.post("/repos/:id/files", authenticate, repoController.uploadFile);
repoRouter.delete("/repos/:id/files/:filePath", authenticate, repoController.deleteFile);

// Commits
repoRouter.get("/repos/:id/commits", repoController.getCommits);

module.exports = repoRouter;
