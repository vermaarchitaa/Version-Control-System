import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GitBranchIcon,
  GitCommitIcon,
  PeopleIcon,
  RepoIcon,
} from "@primer/octicons-react";
import LandingNav from "./LandingNav";
import HeroVisual from "./HeroVisual";
import ProductPreview from "./ProductPreview";
import "./Landing.css";

const FEATURES = [
  {
    icon: RepoIcon,
    title: "Repository Management",
    body: "Create public or private repositories, organize files, and keep every project in a clear developer workflow.",
  },
  {
    icon: PeopleIcon,
    title: "Collaboration",
    body: "Follow developers, star work you care about, and contribute without leaving a shared workspace.",
  },
  {
    icon: GitCommitIcon,
    title: "Version Control",
    body: "Track commits, branches, and history so you always know what changed and why it shipped.",
  },
  {
    icon: GitBranchIcon,
    title: "Developer Community",
    body: "Discover people and projects, explore public work, and grow an open network around your code.",
  },
];

const Landing = () => {
  useEffect(() => {
    const nodes = document.querySelectorAll(".landing-reveal");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      nodes.forEach((el) => el.classList.add("is-visible"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing">
      <a href="#landing-main" className="landing-skip">
        Skip to content
      </a>

      <div className="landing-bg" aria-hidden="true">
        <div className="landing-grid" />
        <div className="landing-orb landing-orb-a" />
        <div className="landing-orb landing-orb-b" />
        <span className="landing-particle p1" />
        <span className="landing-particle p2" />
        <span className="landing-particle p3" />
        <span className="landing-particle p4" />
      </div>

      <LandingNav />

      <main id="landing-main">
        <section className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <p className="landing-kicker">Version control for builders</p>
              <h1>Build. Collaborate. Ship.</h1>
              <p className="landing-lead">
                A modern platform to create repositories, collaborate with developers,
                and manage your code — all in one place.
              </p>
              <div className="landing-hero-actions">
                <Link to="/signup" className="landing-btn landing-btn-primary">
                  Get Started
                </Link>
                <Link to="/explore" className="landing-btn landing-btn-ghost">
                  Explore Projects
                </Link>
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        <section
          id="features"
          className="landing-features landing-reveal"
          aria-labelledby="features-heading"
        >
          <div className="landing-container">
            <header className="landing-section-head">
              <p className="landing-kicker">Capabilities</p>
              <h2 id="features-heading">A workspace built around the work.</h2>
            </header>
            <div className="landing-feature-grid">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="landing-feature-card">
                    <span className="landing-feature-icon" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <ProductPreview />

        <section
          id="about"
          className="landing-about landing-reveal"
          aria-labelledby="about-heading"
        >
          <div className="landing-container landing-about-inner">
            <h2 id="about-heading">Made for focused, real work.</h2>
            <p>
              CodeForge is a dark, developer-first workspace for hosting
              repositories, reviewing history, and collaborating in the open. It is
              inspired by the tools you already know — designed as its own product.
            </p>
          </div>
        </section>

        <section className="landing-cta landing-reveal" aria-labelledby="cta-heading">
          <div className="landing-container">
            <div className="landing-cta-panel">
              <h2 id="cta-heading">Ready to build something great?</h2>
              <p>Create your account and start collaborating with developers.</p>
              <Link to="/signup" className="landing-btn landing-btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-brand">
            <span className="landing-brand-mark" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
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
            <span>CodeForge</span>
          </div>
          <nav className="landing-footer-links" aria-label="Footer">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <Link to="/explore">Explore</Link>
            <Link to="/auth">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </nav>
          <p className="landing-copy">
            © {new Date().getFullYear()} CodeForge. Built for developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
