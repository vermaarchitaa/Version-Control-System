import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { StarIcon, RepoForkedIcon, LockIcon } from "@primer/octicons-react";
import { formatDistanceToNow } from "date-fns";

const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
};

const RepoCard = ({ repo, showOwner = false }) => {
  const navigate = useNavigate();
  const langColor = LANG_COLORS[repo.language] || "#8b949e";
  const timeAgo = repo.updatedAt
    ? formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })
    : "";

  return (
    <div
      className="repo-card"
      onClick={() => navigate(`/repos/${repo._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/repos/${repo._id}`)}
    >
      <div className="repo-card-header">
        <div className="repo-card-name">
          {repo.visibility === "private" && (
            <LockIcon size={14} className="repo-private-icon" />
          )}
          <Link
            to={`/repos/${repo._id}`}
            className="repo-card-link"
            onClick={(e) => e.stopPropagation()}
          >
            {showOwner && repo.owner?.username
              ? `${repo.owner.username} / ${repo.name}`
              : repo.name}
          </Link>
          <span className={`badge ${repo.visibility === "private" ? "badge-red" : "badge-blue"}`}>
            {repo.visibility}
          </span>
        </div>
      </div>

      {repo.description && (
        <p className="repo-card-desc">{repo.description}</p>
      )}

      {repo.topics?.length > 0 && (
        <div className="repo-card-topics">
          {repo.topics.slice(0, 4).map((t) => (
            <span key={t} className="topic-badge">{t}</span>
          ))}
        </div>
      )}

      <div className="repo-card-meta">
        {repo.language && (
          <span className="repo-meta-item">
            <span
              className="lang-dot"
              style={{ background: langColor }}
            />
            {repo.language}
          </span>
        )}
        <span className="repo-meta-item">
          <StarIcon size={14} />
          {repo.stars?.length ?? 0}
        </span>
        <span className="repo-meta-item">
          <RepoForkedIcon size={14} />
          {repo.forks?.length ?? 0}
        </span>
        {timeAgo && (
          <span className="repo-meta-item repo-meta-time">
            Updated {timeAgo}
          </span>
        )}
      </div>
    </div>
  );
};

export default RepoCard;
