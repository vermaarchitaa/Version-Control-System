const express = require("express");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeSelf } = require("../middleware/authorizeMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

const userRouter = express.Router();

// Auth (rate limited)
userRouter.post("/signup", authLimiter, userController.signup);
userRouter.post("/login", authLimiter, userController.login);

// Users
userRouter.get("/users", userController.getAllUsers);
userRouter.get("/users/:id", userController.getUserProfile);
userRouter.put("/users/:id", authenticate, authorizeSelf, userController.updateUserProfile);
userRouter.delete("/users/:id", authenticate, authorizeSelf, userController.deleteUserProfile);

// Follow / Unfollow
userRouter.post("/users/:id/follow", authenticate, userController.followUser);

// Contributions heatmap
userRouter.get("/users/:id/contributions", userController.getContributions);

module.exports = userRouter;
