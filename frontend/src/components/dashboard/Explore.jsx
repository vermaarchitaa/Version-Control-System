import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon, RepoIcon } from "@primer/octicons-react";
import Navbar from "../shared/Navbar";
import RepoCard from "../shared/RepoCard";
import api from "../../utils/api";
import "../shared/RepoCard.css";
import "./Explore.css";

const LANGUAGES = ["", "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "HTML", "CSS", "Ruby"];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [repos, setRepos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const LIMIT = 15;

  const fetchRepos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(query && { search: query }),
        ...(language && { language }),
        sort,
        page,
        limit: LIMIT,
      });
      const res = await api.get(`/repos?${params}`);
      setRepos(res.data.repositories || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Explore fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, language, sort, page]);

  useEffect(() => {
    const timer = setTimeout(fetchRepos, 300);
    return () => clearTimeout(timer);
  }, [fetchRepos]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(query ? { q: query } : {});
    fetchRepos();
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <Navbar />
      <div className="explore-page page-container">
        <div className="explore-header">
          <h1>Explore Repositories</h1>
          <p>Discover interesting projects and people.</p>
        </div>

        {/* Search bar */}
        <form className="explore-search-form" onSubmit={handleSearch}>
          <div className="explore-search-input-wrapper">
            <SearchIcon size={18} className="explore-search-icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search repositories..."
              className="explore-search-input"
            />
          </div>

          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
            className="explore-filter-select"
          >
            <option value="">All Languages</option>
            {LANGUAGES.filter(Boolean).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="explore-filter-select"
          >
            <option value="createdAt">Newest</option>
            <option value="updated">Recently Updated</option>
            <option value="stars">Most Stars</option>
          </select>
        </form>

        {/* Results */}
        <div className="explore-results-header">
          {!loading && (
            <span className="results-count">
              {total > 0 ? `${total} repositories` : "No repositories found"}
              {query && ` for "${query}"`}
            </span>
          )}
        </div>

        {loading ? (
          <div className="loading-repos">
            {[1,2,3,4,5].map((i) => <div key={i} className="repo-skeleton" />)}
          </div>
        ) : repos.length === 0 ? (
          <div className="empty-state">
            <RepoIcon size={32} />
            <h3>No repositories found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="explore-repo-grid">
            {repos.map((repo) => (
              <RepoCard key={repo._id} repo={repo} showOwner />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </button>
            <span className="page-indicator">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Explore;
