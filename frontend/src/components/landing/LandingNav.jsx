import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThreeBarsIcon, XIcon } from "@primer/octicons-react";

const BrandMark = () => (
  <Link to="/" className="landing-brand">
    <span className="landing-brand-mark" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <circle cx="8" cy="8" r="3" fill="currentColor" />
        <circle cx="20" cy="8" r="3" fill="currentColor" />
        <circle cx="14" cy="20" r="3.2" fill="currentColor" />
        <path
          d="M8 8h12M8.8 10.2L13.2 17.4M19.2 10.2L14.8 17.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
    <span className="landing-brand-name">CodeForge</span>
  </Link>
);

const LandingNav = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <BrandMark />

        <nav className="landing-nav-links" aria-label="Landing">
          <Link to="/explore">Explore</Link>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/auth">Sign In</Link>
          <Link to="/signup" className="btn btn-primary">
            Get Started
          </Link>
        </nav>

        <button
          type="button"
          className="landing-nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon size={18} /> : <ThreeBarsIcon size={18} />}
        </button>
      </div>

      {open && (
        <div className="landing-nav-mobile-wrap">
          <nav
            id="landing-mobile-menu"
            className="landing-nav-mobile"
            aria-label="Mobile"
          >
          <Link to="/explore" onClick={close}>
            Explore
          </Link>
          <a href="#features" onClick={close}>
            Features
          </a>
          <a href="#about" onClick={close}>
            About
          </a>
          <Link to="/auth" onClick={close}>
            Sign In
          </Link>
          <Link to="/signup" className="btn btn-primary" onClick={close}>
            Get Started
          </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingNav;
