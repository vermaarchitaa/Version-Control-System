import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import {
  SearchIcon,
  BellIcon,
  PlusIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import BrandMark from "./BrandMark";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const initial = currentUser?.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <BrandMark />
        </div>

        <div className="navbar-center">
          <form className="navbar-search" onSubmit={handleSearch}>
            <SearchIcon size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search or jump to..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search repositories"
            />
          </form>

          <nav className="navbar-links">
            <Link to="/explore">Explore</Link>
          </nav>
        </div>

        <div className="navbar-right">
          {currentUser ? (
            <>
              {/* New repo */}
              <div className="navbar-dropdown-wrapper">
                <button
                  className="navbar-icon-btn"
                  onClick={() => { setShowPlusMenu(!showPlusMenu); setShowDropdown(false); }}
                  aria-label="Create new"
                >
                  <PlusIcon size={16} />
                  <TriangleDownIcon size={12} />
                </button>
                {showPlusMenu && (
                  <div className="dropdown-menu">
                    <Link to="/new" onClick={() => setShowPlusMenu(false)}>
                      New repository
                    </Link>
                  </div>
                )}
              </div>

              <button className="navbar-icon-btn" aria-label="Notifications">
                <BellIcon size={16} />
              </button>

              {/* Avatar dropdown */}
              <div className="navbar-dropdown-wrapper">
                <button
                  className="avatar-btn"
                  onClick={() => { setShowDropdown(!showDropdown); setShowPlusMenu(false); }}
                  aria-label="User menu"
                >
                  <span className="avatar avatar-sm">{initial}</span>
                  <TriangleDownIcon size={12} />
                </button>

                {showDropdown && (
                  <div className="dropdown-menu dropdown-menu-right">
                    <div className="dropdown-header">
                      Signed in as <strong>{currentUser.username}</strong>
                    </div>
                    <hr className="dropdown-divider" />
                    <Link to="/profile" onClick={() => setShowDropdown(false)}>
                      Your profile
                    </Link>
                    <Link to="/" onClick={() => setShowDropdown(false)}>
                      Your repositories
                    </Link>
                    <Link to="/explore" onClick={() => setShowDropdown(false)}>
                      Explore
                    </Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-btn-danger" onClick={handleLogout}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/auth" className="btn btn-outline btn-sm">Sign in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
