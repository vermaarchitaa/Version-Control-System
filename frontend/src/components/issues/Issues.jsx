import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  IssueOpenedIcon,
  IssueClosedIcon,
  XIcon,
  PlusIcon,
} from "@primer/octicons-react";
import { formatDistanceToNow } from "date-fns";
import Navbar from "../shared/Navbar";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import "./Issues.css";

const LABEL_COLORS = {
  bug: "#da3633",
  enhancement: "#1f6feb",
  documentation: "#0075ca",
  "help wanted": "#238636",
  question: "#8957e5",
  wontfix: "#6e7681",
  duplicate: "#6e7681",
};

const Issues = () => {
  const { id } = useParams(); // repo ID
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [repoName, setRepoName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", labels: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const LABELS = ["bug", "enhancement", "documentation", "help wanted", "question", "wontfix", "duplicate"];

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const [issuesRes, repoRes] = await Promise.all([
        api.get(`/repos/${id}/issues?status=${filter}`),
        api.get(`/repos/${id}`),
      ]);
      setIssues(issuesRes.data.issues || []);
      setTotal(issuesRes.data.total || 0);
      setRepoName(repoRes.data.name);
    } catch (err) {
      console.error("Fetch issues error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, filter]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      setSubmitting(true);
      setError("");
      await api.post(`/repos/${id}/issues`, form);
      setForm({ title: "", description: "", labels: [] });
      setShowCreate(false);
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLabel = (label) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  const toggleStatus = async (issue) => {
    try {
      await api.put(`/issues/${issue._id}`, {
        status: issue.status === "open" ? "closed" : "open",
      });
      fetchIssues();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="issues-page page-container">
        {/* Breadcrumb */}
        <div className="issues-breadcrumb">
          <Link to={`/repos/${id}`} className="breadcrumb-link">
            {repoName}
          </Link>
          <span>/</span>
          <span>Issues</span>
        </div>

        {/* Create issue form */}
        {showCreate && currentUser && (
          <div className="create-issue-form card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: "var(--text-primary)" }}>New Issue</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreate(false)}>
                <XIcon size={14} /> Cancel
              </button>
            </div>

            {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Provide more details about the issue..."
                  rows={5}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="form-group">
                <label>Labels</label>
                <div className="label-picker">
                  {LABELS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={`label-pill ${form.labels.includes(label) ? "selected" : ""}`}
                      style={{
                        "--label-color": LABEL_COLORS[label],
                      }}
                      onClick={() => toggleLabel(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary" disabled={submitting || !form.title.trim()}>
                  {submitting ? "Submitting..." : "Submit new issue"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Header + filter row */}
        <div className="issues-header">
          <div className="issues-filter-tabs">
            <button
              className={`issue-filter-tab ${filter === "open" ? "active" : ""}`}
              onClick={() => setFilter("open")}
            >
              <IssueOpenedIcon size={14} />
              Open
            </button>
            <button
              className={`issue-filter-tab ${filter === "closed" ? "active" : ""}`}
              onClick={() => setFilter("closed")}
            >
              <IssueClosedIcon size={14} />
              Closed
            </button>
          </div>

          {currentUser && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreate(!showCreate)}
            >
              <PlusIcon size={14} />
              New issue
            </button>
          )}
        </div>

        {/* Issues list */}
        <div className="issues-list">
          {loading ? (
            <div className="loading-screen" style={{ height: 200 }}>
              <span className="spinner" />
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              {filter === "open" ? (
                <IssueOpenedIcon size={32} />
              ) : (
                <IssueClosedIcon size={32} />
              )}
              <h3>No {filter} issues</h3>
              <p>
                {filter === "open"
                  ? "There are no open issues."
                  : "There are no closed issues."}
              </p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue._id} className="issue-row">
                <div className="issue-status-icon">
                  {issue.status === "open" ? (
                    <IssueOpenedIcon size={16} style={{ color: "#3fb950" }} />
                  ) : (
                    <IssueClosedIcon size={16} style={{ color: "#8b949e" }} />
                  )}
                </div>

                <div className="issue-content">
                  <div className="issue-title-row">
                    <Link
                      to={`/repos/${id}/issues/${issue._id}`}
                      className="issue-title"
                    >
                      {issue.title}
                    </Link>
                    {issue.labels?.map((label) => (
                      <span
                        key={label}
                        className="label-pill-small"
                        style={{ background: `${LABEL_COLORS[label]}22`, color: LABEL_COLORS[label], borderColor: `${LABEL_COLORS[label]}44` }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="issue-meta">
                    #{issue._id?.slice(-6)} opened{" "}
                    {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}{" "}
                    by <strong>{issue.authorName || "unknown"}</strong>
                    {issue.comments?.length > 0 && (
                      <span> · {issue.comments.length} comment{issue.comments.length !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                </div>

                {currentUser && (
                  <button
                    className="btn btn-secondary btn-sm issue-toggle-btn"
                    onClick={() => toggleStatus(issue)}
                    title={issue.status === "open" ? "Close issue" : "Reopen issue"}
                  >
                    {issue.status === "open" ? "Close" : "Reopen"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Issues;
