import React from "react";
import { Link } from "react-router-dom";
import "./BrandMark.css";

const BrandMark = () => (
  <Link to="/" className="brand-mark" aria-label="CodeForge Home">
    <span className="brand-mark-icon" aria-hidden="true">
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
    <span className="brand-mark-name">CodeForge</span>
  </Link>
);

export default BrandMark;
