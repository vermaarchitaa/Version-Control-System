import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  IssueOpenedIcon,
  IssueClosedIcon,
  CommentIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { formatDistanceToNow } from "date-fns";
import Navbar from "../shared/Navbar";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import "./IssueDetail.css";

const LABEL_COLORS = {
  bug: "#da3633", enhancement: "#1f6feb", documentation: "#0075ca",
  "help wanted": "#238636", question: "#8957e5", wontfix: "#6e7681", duplicate: "#6e7681",
};

const IssueDetail = () => {
  const { id: repoId, issueId } = useParams();
  const { currentUser } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchIssue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/issues/${issueId}`);
      setIssue(res.data);
    } catch (err) {
      setError("Failed to load issue.");
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => { fetchIssue(); }, [fetchIssue]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/issues/${issueId}/comments`, { body: comment });
      setComment("");
      fetchIssue();
    } catch (err) {
      setError("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/issues/${issueId}/comments/${commentId}`);
      fetchIssue();
    } catch (err) {
      alert("Failed to delete comment.");
    }
  };

  const handleToggleStatus = async () => {
    try {
      await api.put(`/issues/${issueId}`, {
        status: issue.status === "open" ? "closed" : "open",
      });
      fetchIssue();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-screen"><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      </>
    );
  }

  if (error || !issue) {
    return (
      <>
        <Navbar />
        <div className="page-container"><div className="error-message" style={{ marginTop: 32 }}>{error || "Issue not found."}</div></div>
      </>
    );
  }

  const initial = (name) => name?.charAt(0)?.toUpperCase() || "?";

  return (
    <>
      <Navbar />
      <div className="issue-detail-page page-container">
        {/* Breadcrumb */}
        <div className="issues-breadcrumb">
          <Link to={`/repos/${repoId}`} className="breadcrumb-link">Repository</Link>
          <span>/</span>
          <Link to={`/repos/${repoId}/issues`} className="breadcrumb-link">Issues</Link>
          <span>/</span>
          <span>#{issue._id?.slice(-6)}</span>
        </div>

        {/* Issue header */}
        <div className="issue-header">
          <h1 className="issue-title-h1">{issue.title}</h1>
          <div className="issue-status-row">
            <span className={`issue-status-badge ${issue.status}`}>
              {issue.status === "open"
                ? <><IssueOpenedIcon size={14} /> Open</>
                : <><IssueClosedIcon size={14} /> Closed</>
              }
            </span>
            <span className="issue-subtitle">
              Opened {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })} by{" "}
              <strong>{issue.authorName}</strong>
              {" · "}{issue.comments?.length || 0} comment{issue.comments?.length !== 1 ? "s" : ""}
            </span>
          </div>

          {issue.labels?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className="label-pill-small"
                  style={{ background: `${LABEL_COLORS[label]}22`, color: LABEL_COLORS[label], borderColor: `${LABEL_COLORS[label]}44` }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="issue-timeline">
          {/* Original description */}
          <div className="timeline-item">
            <span className="avatar avatar-md">{initial(issue.authorName)}</span>
            <div className="comment-box">
              <div className="comment-header">
                <strong>{issue.authorName}</strong>
                <span className="comment-time">
                  {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                </span>
                <span className="comment-author-badge">Author</span>
              </div>
              <div className="comment-body">
                {issue.description || <em style={{ color: "var(--text-muted)" }}>No description provided.</em>}
              </div>
            </div>
          </div>

          {/* Comments */}
          {issue.comments?.map((c) => (
            <div key={c._id} className="timeline-item">
              <span className="avatar avatar-md">{initial(c.authorName)}</span>
              <div className="comment-box">
                <div className="comment-header">
                  <strong>{c.authorName || "Unknown"}</strong>
                  <span className="comment-time">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                  {currentUser && c.author === currentUser.id && (
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(c._id)}
                      title="Delete comment"
                    >
                      <TrashIcon size={12} />
                    </button>
                  )}
                </div>
                <div className="comment-body">{c.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add comment + status toggle */}
        <div className="issue-actions-row">
          {currentUser && (
            <button
              className={`btn btn-sm ${issue.status === "open" ? "btn-secondary" : "btn-primary"}`}
              onClick={handleToggleStatus}
            >
              {issue.status === "open" ? "Close issue" : "Reopen issue"}
            </button>
          )}
        </div>

        {currentUser ? (
          <div className="add-comment-section">
            <span className="avatar avatar-md">
              {initial(currentUser.username)}
            </span>
            <form onSubmit={handleComment} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment..."
                rows={4}
                style={{ resize: "vertical" }}
              />
              {error && <div className="error-message">{error}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting || !comment.trim()}
                >
                  {submitting ? "Posting..." : "Comment"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>
            <Link to="/auth">Sign in</Link> to leave a comment.
          </div>
        )}
      </div>
    </>
  );
};

export default IssueDetail;
