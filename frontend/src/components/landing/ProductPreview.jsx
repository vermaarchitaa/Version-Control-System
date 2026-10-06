import React from "react";
import {
  FileDirectoryIcon,
  FileIcon,
  GitBranchIcon,
  GitCommitIcon,
  IssueOpenedIcon,
  PeopleIcon,
} from "@primer/octicons-react";

const files = [
  { name: "src", type: "dir" },
  { name: "controllers", type: "dir", indent: true },
  { name: "repoController.js", type: "file", indent: true },
  { name: "routes", type: "dir", indent: true },
  { name: "README.md", type: "file" },
];

const commits = [
  { hash: "a3f8c1", message: "Add issue labels and filters", author: "Asha", time: "2h" },
  { hash: "91bd02", message: "Protect write routes with JWT", author: "Ken", time: "5h" },
  { hash: "44c0ea", message: "Seed contribution heatmap", author: "Mina", time: "1d" },
];

const ProductPreview = () => (
  <section className="landing-preview landing-reveal" aria-labelledby="preview-heading">
    <div className="landing-container">
      <header className="landing-section-head">
        <p className="landing-kicker">Product preview</p>
        <h2 id="preview-heading">Everything you need to build together.</h2>
        <p className="landing-section-copy">
          Repositories, history, and teammates live in one dark workspace — the same
          language as your dashboard once you sign in.
        </p>
      </header>

      <figure className="preview-frame">
        <div className="preview-chrome">
          <span className="hero-dot hero-dot-red" />
          <span className="hero-dot hero-dot-yellow" />
          <span className="hero-dot hero-dot-green" />
          <span className="preview-title">northstar / orbit-api</span>
          <span className="preview-pill">
            <GitBranchIcon size={12} />
            main
          </span>
        </div>

        <div className="preview-grid">
          <div className="preview-pane">
            <h3>Files</h3>
            <ul>
              {files.map((file) => (
                <li key={file.name} className={file.indent ? "is-indent" : undefined}>
                  {file.type === "dir" ? (
                    <FileDirectoryIcon size={14} />
                  ) : (
                    <FileIcon size={14} />
                  )}
                  {file.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="preview-pane preview-pane-wide">
            <h3>Recent commits</h3>
            <ul className="preview-commits">
              {commits.map((c) => (
                <li key={c.hash}>
                  <GitCommitIcon size={14} />
                  <code>{c.hash}</code>
                  <span className="preview-msg">{c.message}</span>
                  <span className="preview-meta">
                    {c.author} · {c.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="preview-pane">
            <h3>Now</h3>
            <div className="preview-stat">
              <PeopleIcon size={14} />
              <span>12 watching</span>
            </div>
            <div className="preview-stat">
              <IssueOpenedIcon size={14} />
              <span>3 open issues</span>
            </div>
            <div className="preview-avatars">
              <span className="avatar avatar-sm">A</span>
              <span className="avatar avatar-sm">K</span>
              <span className="avatar avatar-sm">M</span>
              <span className="avatar avatar-sm">R</span>
            </div>
          </div>
        </div>
      </figure>
    </div>
  </section>
);

export default ProductPreview;
