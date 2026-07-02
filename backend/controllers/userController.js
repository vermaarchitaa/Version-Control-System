const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Repository = require("../models/repoModel");

// ─── Helper ───────────────────────────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), username: user.username, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function signup(req, res) {
  const { username, password, email } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        error: existingUser.username === username
          ? "Username already taken."
          : "Email already registered.",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    // Record contribution
    const today = new Date().toISOString().split("T")[0];
    newUser.contributions.set(today, (newUser.contributions.get(today) || 0) + 1);
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({ token, userId: newUser._id, username: newUser.username });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Server error during signup." });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = generateToken(user);
    res.json({ token, userId: user._id, username: user.username });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error during login." });
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────
async function getAllUsers(req, res) {
  try {
    const { search } = req.query;
    const query = search
      ? { username: { $regex: search, $options: "i" } }
      : {};
    const users = await User.find(query)
      .select("-password")
      .limit(50)
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
}

async function getUserProfile(req, res) {
  const { id } = req.params;

  try {
    // Support lookup by ID or username
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { username: id };

    const user = await User.findOne(query)
      .select("-password")
      .populate("repositories", "name description visibility stars createdAt language")
      .populate("followers", "username avatarUrl")
      .populate("following", "username avatarUrl")
      .populate("starredRepos", "name description owner");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
}

async function updateUserProfile(req, res) {
  const { id } = req.params;
  const { bio, location, website, avatarUrl, password, email } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (email !== undefined) user.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "Profile updated successfully!", user });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ error: "Failed to update profile." });
  }
}

async function deleteUserProfile(req, res) {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Also delete their repositories
    await Repository.deleteMany({ owner: id });

    res.json({ message: "User profile and repositories deleted." });
  } catch (err) {
    console.error("Delete profile error:", err.message);
    res.status(500).json({ error: "Failed to delete profile." });
  }
}

// ─── Follow / Unfollow ────────────────────────────────────────────────────────
async function followUser(req, res) {
  const targetId = req.params.id;
  const currentId = req.user.id;

  if (targetId === currentId) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }

  try {
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentId),
      User.findById(targetId),
    ]);

    if (!targetUser) return res.status(404).json({ error: "User not found." });

    const alreadyFollowing = currentUser.following.includes(targetId);

    if (alreadyFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentId);
    } else {
      // Follow
      currentUser.following.push(targetId);
      targetUser.followers.push(currentId);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      message: alreadyFollowing ? "Unfollowed." : "Followed.",
      following: !alreadyFollowing,
      followerCount: targetUser.followers.length,
    });
  } catch (err) {
    console.error("Follow error:", err.message);
    res.status(500).json({ error: "Failed to follow/unfollow." });
  }
}

// ─── Contributions ────────────────────────────────────────────────────────────
async function getContributions(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("contributions");
    if (!user) return res.status(404).json({ error: "User not found." });
    // Convert Map to plain object
    const data = Object.fromEntries(user.contributions);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contributions." });
  }
}

module.exports = {
  signup,
  login,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  followUser,
  getContributions,
};
