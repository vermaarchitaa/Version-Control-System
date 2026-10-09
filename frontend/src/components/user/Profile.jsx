import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LocationIcon,
  LinkIcon,
  PeopleIcon,
  RepoIcon,
  StarIcon,
  PencilIcon,
} from "@primer/octicons-react";
import HeatMap from "@uiw/react-heat-map";
import Navbar from "../shared/Navbar";
import RepoCard from "../shared/RepoCard";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import "./Profile.css";
import "../shared/RepoCard.css";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [contributions, setContributions] = useState({});
  const [activeTab, setActiveTab] = useState("repos");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ bio: "", location: "", website: "" });
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const [userRes, reposRes, contribRes] = await Promise.all([
        api.get(`/users/${currentUser.id}`),
        api.get(`/repos/user/${currentUser.id}`),
        api.get(`/users/${currentUser.id}/contributions`),
      ]);
      setUser(userRes.data);
      setRepos(reposRes.data.repositories || []);
      setContributions(contribRes.data || {});
      setEditForm({
        bio: userRes.data.bio || "",
        location: userRes.data.location || "",
        website: userRes.data.website || "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/users/${currentUser.id}`, editForm);
      await fetchProfile();
      setEditMode(false);
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Convert contribution object to heatmap format
  const heatmapData = Object.entries(contributions).map(([date, count]) => ({
    date,
    count,
  }));

  const totalContribs = Object.values(contributions).reduce((a, b) => a + b, 0);
  const initial = user?.username?.charAt(0)?.toUpperCase() || "?";

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-screen"><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-layout page-container">
        {/* Left: User info */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrapper">
            <span className="avatar avatar-xl profile-avatar">{initial}</span>
          </div>

          <h1 className="profile-username">{user?.username}</h1>
          {user?.bio && <p className="profile-bio">{user.bio}</p>}

          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us a little about yourself"
                  rows={3}
                  maxLength={160}
                  style={{ resize: "none" }}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://yoursite.com"
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setEditMode(true)}>
              <PencilIcon size={14} /> Edit profile
            </button>
          )}

          <div className="profile-stats">
            <span><PeopleIcon size={14} /> <strong>{user?.followers?.length || 0}</strong> followers</span>
            <span>·</span>
            <span><strong>{user?.following?.length || 0}</strong> following</span>
          </div>

          {user?.location && (
            <div className="profile-info-item">
              <LocationIcon size={14} />
              {user.location}
            </div>
          )}
          {user?.website && (
            <div className="profile-info-item">
              <LinkIcon size={14} />
              <a href={user.website} target="_blank" rel="noreferrer">{user.website}</a>
            </div>
          )}

          <button
            className="btn btn-danger"
            style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
            onClick={() => { logout(); navigate("/auth"); }}
          >
            Sign out
          </button>
        </aside>

        {/* Right: Tabs + content */}
        <main className="profile-main">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === "repos" ? "active" : ""}`}
              onClick={() => setActiveTab("repos")}
            >
              <RepoIcon size={16} />
              Repositories
              <span className="tab-count">{repos.length}</span>
            </button>
            <button
              className={`profile-tab ${activeTab === "starred" ? "active" : ""}`}
              onClick={() => setActiveTab("starred")}
            >
              <StarIcon size={16} />
              Starred
              <span className="tab-count">{user?.starredRepos?.length || 0}</span>
            </button>
          </div>

          {/* Contribution heatmap */}
          {activeTab === "repos" && (
            <div className="heatmap-section card">
              <div className="heatmap-header">
                <span className="heatmap-title">
                  <strong>{totalContribs}</strong> contributions in the last year
                </span>
              </div>
              <div className="heatmap-wrapper">
                {heatmapData.length > 0 ? (
                  <HeatMap
                    value={heatmapData}
                    width="100%"
                    style={{ color: "#8b949e" }}
                    rectSize={12}
                    space={3}
                    panelColors={{
                      0: "#161b22",
                      2: "#0e4429",
                      4: "#006d32",
                      6: "#26a641",
                      10: "#39d353",
                    }}
                  />
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                    No activity yet. Create repositories and commit files to see contributions!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Repos list */}
          {activeTab === "repos" && (
            <div>
              {repos.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">
                    <RepoIcon size={28} />
                  </span>
                  <h3>No repositories yet</h3>
                  <p>Start building something awesome.</p>
                  <Link to="/new" className="btn btn-primary">New repository</Link>
                </div>
              ) : (
                <div className="repo-list">
                  {repos.map((repo) => (
                    <RepoCard key={repo._id} repo={repo} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Starred repos */}
          {activeTab === "starred" && (
            <div>
              {(!user?.starredRepos || user.starredRepos.length === 0) ? (
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">
                    <StarIcon size={28} />
                  </span>
                  <h3>No starred repositories</h3>
                  <p>Star repositories you want to keep an eye on.</p>
                </div>
              ) : (
                <div className="repo-list">
                  {user.starredRepos.map((repo) => (
                    <RepoCard key={repo._id} repo={repo} showOwner />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Profile;
