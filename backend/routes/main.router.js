const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);

mainRouter.get("/", (req, res) => {
  res.json({
    message: "GitHub Clone API",
    version: "2.0.0",
    endpoints: {
      auth: ["POST /api/signup", "POST /api/login"],
      users: ["GET /api/users", "GET /api/users/:id", "PUT /api/users/:id"],
      repos: ["GET /api/repos", "POST /api/repos", "GET /api/repos/:id"],
      issues: ["GET /api/repos/:id/issues", "POST /api/repos/:id/issues"],
    },
  });
});

module.exports = mainRouter;
