import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RepoIcon } from "@primer/octicons-react";
import Navbar from "../shared/Navbar";
import { useAuth } from "../../context/authContext";
import api from "../../utils/api";
import "./CreateRepo.css";

const LANGUAGES = [
  "", "JavaScript", "TypeScript", "Python", "Java", "C++", "C", "Ruby",
  "Go", "Rust", "HTML", "CSS", "PHP", "Swift", "Kotlin", "Shell",
];

const CreateRepo = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    visibility: "public",
    language: "",
    topics: "",
    readme: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");

  const validateName = (name) => {
    if (!name) return "Repository name is required.";
    if (name.length > 100) return "Name must be 100 characters or fewer.";
    if (!/^[a-zA-Z0-9._-]+$/.test(name))
      return "Name may only contain alphanumeric characters, periods, hyphens, or underscores.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (name === "name") setNameError(validateName(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateName(form.name);
    if (nameErr) { setNameError(nameErr); return; }
    setError("");

    try {
      setLoading(true);
      const topics = form.topics
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const readmeContent = form.readme
        ? `# ${form.name}\n\n${form.description || "A new repository."}\n`
        : "";

      const res = await api.post("/repos", {
        name: form.name,
        description: form.description,
        visibility: form.visibility,
        language: form.language,
        topics,
        readme: readmeContent,
      });

      navigate(`/repos/${res.data.repository._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create repository.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-page page-container">
        <div className="create-repo-header">
          <RepoIcon size={24} />
          <div>
            <h1>Create a new repository</h1>
            <p>A repository contains all project files, including revision history.</p>
          </div>
        </div>

        <div className="divider" />

        {error && <div className="error-message" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} className="create-repo-form">
          {/* Owner / Name */}
          <div className="form-row">
            <div className="form-group">
              <label>Owner</label>
              <div className="owner-display">
                <span className="avatar avatar-sm">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </span>
                {currentUser?.username}
              </div>
            </div>

            <div className="form-separator">/</div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="name">
                Repository name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="my-awesome-project"
                required
                autoFocus
              />
              {nameError && <span className="field-error">{nameError}</span>}
              {form.name && !nameError && (
                <span className="field-hint field-hint-good">
                  ✓ "{currentUser?.username}/{form.name}" is available
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description <span className="optional">(optional)</span></label>
            <input
              id="description"
              name="description"
              type="text"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description of your project..."
            />
          </div>

          <div className="divider" />

          {/* Visibility */}
          <div className="form-group">
            <label>Visibility</label>
            <div className="radio-group">
              <label className={`radio-option ${form.visibility === "public" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={form.visibility === "public"}
                  onChange={handleChange}
                />
                <div>
                  <div className="radio-label">🌍 Public</div>
                  <div className="radio-hint">Anyone on the internet can see this repository.</div>
                </div>
              </label>

              <label className={`radio-option ${form.visibility === "private" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={form.visibility === "private"}
                  onChange={handleChange}
                />
                <div>
                  <div className="radio-label">🔒 Private</div>
                  <div className="radio-hint">You choose who can see and commit to this repository.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="divider" />

          {/* Language */}
          <div className="form-group">
            <label htmlFor="language">Primary Language <span className="optional">(optional)</span></label>
            <select id="language" name="language" value={form.language} onChange={handleChange}>
              <option value="">Select a language...</option>
              {LANGUAGES.filter(Boolean).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Topics */}
          <div className="form-group">
            <label htmlFor="topics">Topics <span className="optional">(optional)</span></label>
            <input
              id="topics"
              name="topics"
              type="text"
              value={form.topics}
              onChange={handleChange}
              placeholder="e.g. react, node, open-source (comma separated)"
            />
          </div>

          {/* README */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="readme"
                checked={form.readme}
                onChange={handleChange}
                style={{ width: "auto" }}
              />
              <div>
                <div className="checkbox-title">Initialize this repository with a README</div>
                <div className="checkbox-hint">This will let you immediately clone the repository to your computer.</div>
              </div>
            </label>
          </div>

          <div className="divider" />

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !!nameError || !form.name}
            >
              {loading ? "Creating..." : "Create repository"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateRepo;
