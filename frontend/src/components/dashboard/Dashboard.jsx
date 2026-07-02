import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RepoIcon,
  PlusIcon,
  SearchIcon,
  BookIcon,
} from "@primer/octicons-react";
import Navbar from "../shared/Navbar";
import RepoCard from "../shared/RepoCard";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import "./Dashboard.css";
import "../shared/RepoCard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [suggestedRepos, setSuggestedRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | public | private

  const fetchData = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const [userRepos, allRepos] = await Promise.all([
        api.get(`/repos/user/${currentUser.id}`),
        api.get("/repos?limit=5"),
      ]);
      setRepos(userRepos.data.repositories || []);

      // Suggest repos not owned by current user
      const others = (allRepos.data.repositories || []).filter(
        (r) => r.owner?._id !== currentUser.id
      );
      setSuggestedRepos(others.slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = repos.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "public" && r.visibility === "public") ||
      (filter === "private" && r.visibility === "private");
    return matchSearch && matchFilter;
  });

  return (
    <>
      <Navbar />
      <div className="dashboard-layout page-container">
        {/* Left sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user">
            <span className="avatar avatar-lg">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </span>
            <Link to="/profile" className="sidebar-username">
              {currentUser?.username}
            </Link>
          </div>

          <nav className="sidebar-nav">
            <Link to="/profile" className="sidebar-nav-item">
              <BookIcon size={16} />
              Overview
            </Link>
            <Link to="/" className="sidebar-nav-item active">
              <RepoIcon size={16} />
              Repositories
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="dashboard-main">
          {/* Repos header */}
          <div className="section-header">
            <div className="search-filter-row">
              <div className="search-input-wrapper">
                <SearchIcon size={16} className="search-icon-inline" />
                <input
                  type="text"
                  placeholder="Find a repository..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="repo-search-input"
                />
              </div>

              <div className="filter-tabs">
                {["all", "public", "private"].map((f) => (
                  <button
                    key={f}
                    className={`filter-tab ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <Link to="/new" className="btn btn-primary btn-sm">
                <PlusIcon size={14} />
                New
              </Link>
            </div>
          </div>

          {/* Repo list */}
          {loading ? (
            <div className="loading-repos">
              {[1, 2, 3].map((i) => (
                <div key={i} className="repo-skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <RepoIcon size={32} />
              <h3>
                {searchQuery
                  ? `No repositories matching "${searchQuery}"`
                  : "No repositories yet"}
              </h3>
              <p>
                {searchQuery
                  ? "Try a different search term."
                  : "Get started by creating a new repository."}
              </p>
              {!searchQuery && (
                <Link to="/new" className="btn btn-primary">
                  <PlusIcon size={14} />
                  Create repository
                </Link>
              )}
            </div>
          ) : (
            <div className="repo-list">
              {filtered.map((repo) => (
                <RepoCard key={repo._id} repo={repo} />
              ))}
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="dashboard-right-sidebar">
          <h3 className="sidebar-section-title">Explore repositories</h3>
          {suggestedRepos.length === 0 ? (
            <p className="sidebar-empty">Nothing to suggest yet.</p>
          ) : (
            <div className="suggested-list">
              {suggestedRepos.map((repo) => (
                <div
                  key={repo._id}
                  className="suggested-item"
                  onClick={() => navigate(`/repos/${repo._id}`)}
                >
                  <RepoIcon size={14} />
                  <div>
                    <div className="suggested-name">
                      {repo.owner?.username}/{repo.name}
                    </div>
                    {repo.description && (
                      <div className="suggested-desc">{repo.description}</div>
                    )}
                  </div>
                </div>
              ))}
              <Link to="/explore" className="explore-link">
                Explore more →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default Dashboard;
