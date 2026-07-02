const express = require("express");
const issueController = require("../controllers/issueController");
const { authenticate } = require("../middleware/authMiddleware");

const issueRouter = express.Router();

// Issues for a repo
issueRouter.post("/repos/:id/issues", authenticate, issueController.createIssue);
issueRouter.get("/repos/:id/issues", issueController.getAllIssues);

// Single issue
issueRouter.get("/issues/:id", issueController.getIssueById);
issueRouter.put("/issues/:id", authenticate, issueController.updateIssueById);
issueRouter.delete("/issues/:id", authenticate, issueController.deleteIssueById);

// Comments
issueRouter.post("/issues/:id/comments", authenticate, issueController.addComment);
issueRouter.delete("/issues/:id/comments/:commentId", authenticate, issueController.deleteComment);

module.exports = issueRouter;
