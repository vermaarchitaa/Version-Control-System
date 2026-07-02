import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  StarIcon,
  RepoForkedIcon,
  EyeIcon,
  CodeIcon,
  IssueOpenedIcon,
  GitCommitIcon,
  GitBranchIcon,
  FileIcon,
  TrashIcon,
  PlusIcon,
  LockIcon,
  MarkdownIcon,
} from "@primer/octicons-react";
import { formatDistanceToNow } from "date-fns";
import Navbar from "../shared/Navbar";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import "./RepoDetail.css";

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Java: "#b07219", "C++": "#f34b7d", Go: "#00ADD8", Rust: "#dea584",
  HTML: "#e34c26", CSS: "#563d7c",
};

const RepoDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [activeTab, setActiveTab] = useState("code");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState({ name: "", content: "", message: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showReadme, setShowReadme] = useState(true);

  const isOwner = currentUser && repo?.owner?._id === currentUser.id;

  const fetchRepo = useCallback(async () => {
    try {
      setLoading(true);
      const [repoRes, filesRes, commitsRes, branchesRes] = await Promise.all([
        api.get(`/repos/${id}`),
        api.get(`/repos/${id}/files`),
        api.get(`/repos/${id}/commits`),
        api.get(`/repos/${id}/branches`),
      ]);
      setRepo(repoRes.data);
      setFiles(filesRes.data.files || []);
      setCommits(commitsRes.data.commits || []);
      setBranches(branchesRes.data.branches || []);
      setStarCount(repoRes.data.stars?.length || 0);
      if (currentUser) {
        setStarred(repoRes.data.stars?.some((s) =>
          (s._id || s) === currentUser.id
        ));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load repository.");
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => { fetchRepo(); }, [fetchRepo]);

  const handleStar = async () => {
    if (!currentUser) { navigate("/auth"); return; }
    try {
      const res = await api.post(`/repos/${id}/star`);
      setStarred(res.data.starred);
      setStarCount(res.data.starCount);
    } catch (err) {
      console.error("Star error:", err);
    }
  };

  const handleFork = async () => {
    if (!currentUser) { navigate("/auth"); return; }
    try {
      const res = await api.post(`/repos/${id}/fork`);
      navigate(`/repos/${res.data.repository._id}`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to fork.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${repo.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/repos/${id}`);
      navigate("/");
    } catch (err) {
      alert("Failed to delete repository.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    if (!uploadFile.name || !uploadFile.content) {
      setUploadError("File name and content are required.");
      return;
    }
    try {
      setUploading(true);
      await api.post(`/repos/${id}/files`, {
        name: uploadFile.name,
        path: uploadFile.name,
        content: uploadFile.content,
        commitMessage: uploadFile.message || `Add ${uploadFile.name}`,
      });
      setUploadFile({ name: "", content: "", message: "" });
      setShowUpload(false);
      fetchRepo();
    } catch (err) {
      setUploadError(err.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filePath) => {
    if (!window.confirm(`Delete "${filePath}"?`)) return;
    try {
      await api.delete(`/repos/${id}/files/${encodeURIComponent(filePath)}`);
      fetchRepo();
    } catch (err) {
      alert("Failed to delete file.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-screen">
          <span className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="error-message" style={{ marginTop: 32 }}>{error}</div>
        </div>
      </>
    );
  }

  const langColor = LANG_COLORS[repo?.language] || "#8b949e";

  return (
    <>
      <Navbar />
      <div className="repo-detail-page page-container">
        {/* Header */}
        <div className="repo-header">
          <div className="repo-title-row">
            <div className="repo-title">
              {repo.visibility === "private" && <LockIcon size={16} className="repo-private-icon" />}
              <Link to={`/users/${repo.owner?.username}`} className="repo-owner-link">
                {repo.owner?.username}
              </Link>
              <span className="repo-title-slash">/</span>
              <span className="repo-name">{repo.name}</span>
              <span className={`badge ${repo.visibility === "private" ? "badge-red" : ""}`}>
                {repo.visibility}
              </span>
            </div>

            <div className="repo-actions">
              <button
                className={`btn btn-secondary btn-sm ${starred ? "starred" : ""}`}
                onClick={handleStar}
              >
                <StarIcon size={14} />
                {starred ? "Starred" : "Star"} {starCount > 0 && <span className="badge">{starCount}</span>}
              </button>

              <button className="btn btn-secondary btn-sm" onClick={handleFork}>
                <RepoForkedIcon size={14} />
                Fork <span className="badge">{repo.forks?.length || 0}</span>
              </button>

              {isOwner && (
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  <TrashIcon size={14} />
                  Delete
                </button>
              )}
            </div>
          </div>

          {repo.description && (
            <p className="repo-description">{repo.description}</p>
          )}

          {repo.topics?.length > 0 && (
            <div className="repo-topics">
              {repo.topics.map((t) => (
                <span key={t} className="topic-badge">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tab navigation */}
        <nav className="repo-tabs">
          {[
            { id: "code", icon: <CodeIcon size={16} />, label: "Code", count: files.length },
            { id: "issues", icon: <IssueOpenedIcon size={16} />, label: "Issues", count: repo.issues?.length || 0 },
            { id: "commits", icon: <GitCommitIcon size={16} />, label: "Commits", count: commits.length },
            { id: "branches", icon: <GitBranchIcon size={16} />, label: "Branches", count: branches.length },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`repo-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                if (tab.id === "issues") navigate(`/repos/${id}/issues`);
                else setActiveTab(tab.id);
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </nav>

        {/* Code Tab */}
        {activeTab === "code" && (
          <div className="repo-code-section">
            {/* Branch + stats bar */}
            <div className="code-toolbar">
              <div className="branch-selector">
                <GitBranchIcon size={14} />
                <select
                  className="branch-select"
                  defaultValue={repo.defaultBranch}
                >
                  {branches.map((b) => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="code-stats">
                <span><GitCommitIcon size={14} /> {commits.length} commits</span>
                <span><GitBranchIcon size={14} /> {branches.length} branches</span>
                {repo.language && (
                  <span>
                    <span className="lang-dot" style={{ background: langColor }} />
                    {repo.language}
                  </span>
                )}
              </div>

              {isOwner && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowUpload(!showUpload)}
                >
                  <PlusIcon size={14} />
                  Add file
                </button>
              )}
            </div>

            {/* Upload form */}
            {showUpload && isOwner && (
              <div className="upload-form card" style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 12, color: "var(--text-primary)" }}>Add a new file</h4>
                {uploadError && <div className="error-message" style={{ marginBottom: 10 }}>{uploadError}</div>}
                <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="form-group">
                    <label>File name</label>
                    <input
                      type="text"
                      value={uploadFile.name}
                      onChange={(e) => setUploadFile((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. README.md"
                    />
                  </div>
                  <div className="form-group">
                    <label>Content</label>
                    <textarea
                      value={uploadFile.content}
                      onChange={(e) => setUploadFile((p) => ({ ...p, content: e.target.value }))}
                      placeholder="Paste or type file content here..."
                      rows={8}
                      style={{ fontFamily: "var(--font-mono)", fontSize: 13, resize: "vertical" }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Commit message</label>
                    <input
                      type="text"
                      value={uploadFile.message}
                      onChange={(e) => setUploadFile((p) => ({ ...p, message: e.target.value }))}
                      placeholder={`Add ${uploadFile.name || "file"}`}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
                      {uploading ? "Committing..." : "Commit new file"}
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowUpload(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* File tree */}
            {files.length === 0 ? (
              <div className="empty-state" style={{ border: "1px solid var(--border-color)", borderRadius: 8 }}>
                <FileIcon size={32} />
                <h3>This repository is empty</h3>
                {isOwner ? (
                  <p>Start by adding files to your repository.</p>
                ) : (
                  <p>The owner hasn't added any files yet.</p>
                )}
              </div>
            ) : (
              <div className="file-tree">
                <div className="file-tree-header">
                  <span>{files.length} file{files.length !== 1 ? "s" : ""}</span>
                </div>
                {files.map((file, i) => (
                  <div key={i} className="file-tree-row">
                    <FileIcon size={14} className="file-icon" />
                    <span className="file-name">{file.name}</span>
                    <span className="file-commit-msg">{file.lastCommitMessage}</span>
                    <span className="file-size">{file.size > 0 ? `${(file.size / 1024).toFixed(1)} KB` : ""}</span>
                    {isOwner && (
                      <button
                        className="file-delete-btn"
                        onClick={() => handleDeleteFile(file.path)}
                        title="Delete file"
                      >
                        <TrashIcon size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* README */}
            {repo.readme && (
              <div className="readme-section card" style={{ marginTop: 16 }}>
                <div className="readme-header" onClick={() => setShowReadme(!showReadme)}>
                  <MarkdownIcon size={16} />
                  <span>README.md</span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 12 }}>
                    {showReadme ? "▲ Hide" : "▼ Show"}
                  </span>
                </div>
                {showReadme && (
                  <div className="readme-content">
                    <pre>{repo.readme}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Commits Tab */}
        {activeTab === "commits" && (
          <div className="commits-section">
            <h3 style={{ color: "var(--text-primary)", marginBottom: 16 }}>
              Commit history ({commits.length})
            </h3>
            {commits.length === 0 ? (
              <div className="empty-state">
                <GitCommitIcon size={32} />
                <h3>No commits yet</h3>
                <p>Add files to start committing.</p>
              </div>
            ) : (
              <div className="commits-list">
                {commits.map((commit) => (
                  <div key={commit.commitId} className="commit-item">
                    <GitCommitIcon size={16} className="commit-icon" />
                    <div className="commit-info">
                      <div className="commit-message">{commit.message}</div>
                      <div className="commit-meta">
                        <span>{commit.authorName || "Unknown"}</span>
                        <span>·</span>
                        <span>
                          {commit.createdAt
                            ? formatDistanceToNow(new Date(commit.createdAt), { addSuffix: true })
                            : ""}
                        </span>
                        {commit.files?.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{commit.files.length} file{commit.files.length !== 1 ? "s" : ""}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <code className="commit-sha">{commit.commitId?.slice(0, 7)}</code>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === "branches" && (
          <div className="branches-section">
            <h3 style={{ color: "var(--text-primary)", marginBottom: 16 }}>
              Branches ({branches.length})
            </h3>
            <div className="branches-list">
              {branches.map((branch) => (
                <div key={branch.name} className="branch-item">
                  <GitBranchIcon size={14} className="branch-icon" />
                  <span className="branch-name">{branch.name}</span>
                  {branch.isDefault && <span className="badge badge-green">default</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RepoDetail;
