import React from "react";
import {
  GitBranchIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  RepoForkedIcon,
  StarIcon,
  DotFillIcon,
} from "@primer/octicons-react";

const HeroVisual = () => (
  <div className="hero-visual" aria-hidden="true">
    <div className="hero-visual-glow" />

    <article className="hero-float-card hero-float-pr">
      <GitPullRequestIcon size={14} />
      <div>
        <strong>PR #42 merged</strong>
        <span>into main · 2m ago</span>
      </div>
    </article>

    <article className="hero-float-card hero-float-people">
      <div className="hero-avatar-row">
        <span className="avatar avatar-sm">A</span>
        <span className="avatar avatar-sm">K</span>
        <span className="avatar avatar-sm">M</span>
      </div>
      <div>
        <strong>4 contributors</strong>
        <span>shipping together</span>
      </div>
    </article>

    <article className="hero-float-card hero-float-stars">
      <StarIcon size={14} />
      <strong>1.2k</strong>
      <span>stars</span>
      <RepoForkedIcon size={14} />
      <strong>86</strong>
      <span>forks</span>
    </article>

    <div className="hero-repo-frame">
      <div className="hero-repo-chrome">
        <span className="hero-dot hero-dot-red" />
        <span className="hero-dot hero-dot-yellow" />
        <span className="hero-dot hero-dot-green" />
        <span className="hero-repo-path">northstar / orbit-api</span>
      </div>

      <div className="hero-repo-meta">
        <span className="hero-branch">
          <GitBranchIcon size={12} />
          main
        </span>
        <span className="hero-live">
          <DotFillIcon size={12} />
          live
        </span>
      </div>

      <div className="hero-code">
        <div className="hero-code-gutter" aria-hidden="true">
          <span>12</span>
          <span>13</span>
          <span>14</span>
          <span>15</span>
          <span>16</span>
        </div>
        <pre>
          <code>
            <span className="tok-kw">async function</span>{" "}
            <span className="tok-fn">shipRelease</span>
            (tag) {"{"}
            {"\n"}
            {"  "}
            <span className="tok-kw">await</span>{" "}
            <span className="tok-fn">commit</span>
            (<span className="tok-str">&quot;chore: cut tag&quot;</span>);
            {"\n"}
            {"  "}
            <span className="tok-kw">await</span>{" "}
            <span className="tok-fn">openPull</span>
            (<span className="tok-str">&quot;main&quot;</span>);
            {"\n"}
            {"  "}
            <span className="tok-kw">return</span>{" "}
            <span className="tok-fn">deploy</span>
            (tag);
            {"\n"}
            {"}"}
          </code>
        </pre>
      </div>

      <div className="hero-activity">
        <GitCommitIcon size={12} />
        <span>feat: add review workflow</span>
        <span className="hero-activity-time">just now</span>
      </div>

      <div className="hero-spark">
        {[40, 55, 35, 70, 48, 82, 60, 90, 72, 88, 64, 96].map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  </div>
);

export default HeroVisual;
