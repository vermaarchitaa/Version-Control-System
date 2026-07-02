const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const mainRouter = require("./routes/main.router");
const { initRepo } = require("./controllers/git/init");
const { addRepo } = require("./controllers/git/add");
const { commitRepo } = require("./controllers/git/commit");
const { pushRepo } = require("./controllers/git/push");
const { pullRepo } = require("./controllers/git/pull");
const { revertRepo } = require("./controllers/git/revert");
const { logRepo } = require("./controllers/git/log");
const { statusRepo } = require("./controllers/git/status");

dotenv.config();

// ─── CLI Commands ────────────────────────────────────────────────────────────
yargs(hideBin(process.argv))
  .command("start", "Starts the API server", {}, startServer)
  .command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to staging area",
    (y) => y.positional("file", { type: "string" }),
    (argv) => addRepo(argv.file)
  )
  .command(
    "commit <message>",
    "Commit staged files",
    (y) => y.positional("message", { type: "string" }),
    (argv) => commitRepo(argv.message)
  )
  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (y) => y.positional("commitID", { type: "string" }),
    (argv) => revertRepo(argv.commitID)
  )
  .command("log", "Show commit history", {}, logRepo)
  .command("status", "Show working tree status", {}, statusRepo)
  .demandCommand(1, "You need at least one command")
  .help().argv;

// ─── Server ──────────────────────────────────────────────────────────────────
function startServer() {
  const app = express();
  const port = process.env.PORT || 3002;

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:3000"];

  app.use(cors({ origin: allowedOrigins, credentials: true }));

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected!"))
    .catch((err) => {
      console.error("❌ MongoDB error:", err);
      process.exit(1);
    });

  app.use("/api", mainRouter);

  app.get("/health", (_, res) =>
    res.json({ status: "ok", uptime: process.uptime() })
  );

  // 404 handler
  app.use((req, res) => res.status(404).json({ error: "Route not found" }));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal server error" });
  });

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("joinRoom", (userID) => {
      socket.join(userID);
    });

    socket.on("joinRepo", (repoID) => {
      socket.join(`repo:${repoID}`);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}
