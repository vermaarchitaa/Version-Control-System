import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LocationIcon,
  LinkIcon,
  PeopleIcon,
  RepoIcon,
} from "@primer/octicons-react";
import HeatMap from "@uiw/react-heat-map";
import Navbar from "../shared/Navbar";
import RepoCard from "../shared/RepoCard";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import "../user/Profile.css";
import "../shared/RepoCard.css";

const UserPublicProfile = () => {
  const { username } = useParams();
  const { currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("repos");
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await api.get(`/users/${username}`);
      const u = userRes.data;
      setUser(u);

      const [reposRes, contribRes] = await Promise.all([
        api.get(`/repos/user/${u._id}`),
        api.get(`/users/${u._id}/contributions`),
      ]);

      setRepos(reposRes.data.repositories || []);
      setContributions(contribRes.data || {});

      if (currentUser) {
        setFollowing(u.followers?.some(
          (f) => (f._id || f) === currentUser.id
        ));
      }
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [username, currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFollow = async () => {
    if (!currentUser || !user) return;
    try {
      setFollowLoading(true);
      const res = await api.post(`/users/${user._id}/follow`);
      setFollowing(res.data.following);
      setUser((prev) => ({
        ...prev,
        followers: res.data.following
          ? [...(prev.followers || []), { _id: currentUser.id }]
          : (prev.followers || []).filter((f) => (f._id || f) !== currentUser.id),
      }));
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Build heatmap data from contributions object
  const heatmapData = Object.entries(contributions).map(([date, count]) => ({
    date,
    count,
  }));

  const initial = user?.username?.charAt(0).toUpperCase() || "?";
  const isOwnProfile = currentUser?.id === user?._id;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-screen">Loading profile...</div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Navbar />
        <div className="profile-page page-container">
          <div className="empty-state">
            <h2>User not found</h2>
            <p>@{username} does not exist on GitHub Clone.</p>
            <Link to="/explore" className="btn btn-secondary" style={{ marginTop: 16 }}>
              Explore Repositories
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page page-container">
        {/* Left sidebar */}
        <aside className="profile-sidebar">
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="avatar-xl" />
            ) : (
              <div className="avatar-xl" style={{
                background: "linear-gradient(135deg, #388bfd22, #bc8cff22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 80, fontWeight: 700, color: "var(--text-primary)",
                borderRadius: "50%", border: "1px solid var(--border-color)",
                width: 260, height: 260,
              }}>
                {initial}
              </div>
            )}
          </div>

          <h1 className="profile-username">{user?.username}</h1>
          {user?.bio && <p className="profile-bio">{user.bio}</p>}

          {/* Follow button */}
          {currentUser && !isOwnProfile && (
            <button
              className={`btn ${following ? "btn-secondary" : "btn-primary"} profile-follow-btn`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {followLoading ? "..." : following ? "Unfollow" : "Follow"}
            </button>
          )}
          {isOwnProfile && (
            <Link to="/profile" className="btn btn-secondary profile-follow-btn">
              Edit profile
            </Link>
          )}

          {/* Stats */}
          <div className="profile-stats">
            <PeopleIcon size={16} />
            <span>
              <strong>{user?.followers?.length || 0}</strong>{" "}
              <span className="stat-label">followers</span>
            </span>
            <span className="stat-dot">·</span>
            <span>
              <strong>{user?.following?.length || 0}</strong>{" "}
              <span className="stat-label">following</span>
            </span>
          </div>

          {/* Meta */}
          {user?.location && (
            <div className="profile-meta-item">
              <LocationIcon size={16} />
              <span>{user.location}</span>
            </div>
          )}
          {user?.website && (
            <div className="profile-meta-item">
              <LinkIcon size={16} />
              <a href={user.website} target="_blank" rel="noopener noreferrer">
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          <div className="profile-meta-item">
            <RepoIcon size={16} />
            <span>{repos.length} public repositories</span>
          </div>
        </aside>

        {/* Main */}
        <main className="profile-main">
          <div className="profile-tabs">
            <button
              className={`tab-item ${activeTab === "repos" ? "active" : ""}`}
              onClick={() => setActiveTab("repos")}
            >
              <RepoIcon size={16} />
              Repositories
              <span className="tab-count">{repos.length}</span>
            </button>
          </div>

          {/* Heatmap */}
          <div className="heatmap-container">
            <h3 className="heatmap-title">
              {heatmapData.reduce((a, b) => a + b.count, 0)} contributions in the past year
            </h3>
            <HeatMap
              value={heatmapData}
              startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              endDate={new Date()}
              style={{ color: "var(--text-secondary)", width: "100%" }}
              rectSize={11}
              space={2}
              panelColors={{
                0: "#161b22",
                2: "#0e4429",
                4: "#006d32",
                8: "#26a641",
                16: "#39d353",
              }}
            />
          </div>

          {/* Repos */}
          {activeTab === "repos" && (
            <div className="profile-repos">
              {repos.length === 0 ? (
                <div className="empty-state">
                  <RepoIcon size={32} />
                  <h3>{user.username} has no public repositories yet.</h3>
                </div>
              ) : (
                repos.map((repo) => <RepoCard key={repo._id} repo={repo} />)
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default UserPublicProfile;
