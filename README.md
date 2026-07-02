# GitHub Clone — Advanced Version Control System

A full-stack GitHub-inspired version control platform built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

---

## 🚀 Features

### Authentication & Users
- ✅ JWT-based login / signup with bcrypt password hashing
- ✅ Auth middleware (was empty in original — now fully implemented)
- ✅ Follow / Unfollow other users
- ✅ Public user profiles with bio, location, website
- ✅ Contribution heatmap (GitHub-style activity graph)
- ✅ Edit profile (bio, location, website)

### Repositories
- ✅ Create public / private repositories
- ✅ Star / Unstar repositories
- ✅ Fork repositories
- ✅ Branch management (create branches, default branch)
- ✅ File upload / view / delete with inline editor
- ✅ Commit history tracking
- ✅ README rendering
- ✅ Repository language, topics/tags
- ✅ Search & filter repositories
- ✅ Pagination on explore page
- ✅ Owner-only delete/edit (authorization middleware)

### Issues
- ✅ Create / update / close / delete issues
- ✅ Label system (bug, enhancement, documentation, etc.)
- ✅ Comment on issues
- ✅ Filter issues by status (open/closed)
- ✅ Real-time new issue notifications via Socket.IO

### CLI (Git-like commands)
- ✅ `node index.js init` — Initialize repository
- ✅ `node index.js add <file>` — Stage file (or `.` for all)
- ✅ `node index.js commit <message>` — Commit staged files
- ✅ `node index.js push` — Push to AWS S3
- ✅ `node index.js pull` — Pull from AWS S3
- ✅ `node index.js revert <commitID>` — Revert to commit
- ✅ `node index.js log` — View commit history
- ✅ `node index.js status` — Show staging area status

### UI/UX
- ✅ Dark mode (GitHub-style)
- ✅ Responsive layout
- ✅ Skeleton loading states
- ✅ Real-time Socket.IO integration
- ✅ Centralized API client with automatic JWT headers
- ✅ Global error handling & 401 redirect

---

## 🐛 Bugs Fixed from Original

| File | Bug | Fix |
|------|-----|-----|
| `userController.js` | `result.insertId` (undefined) | Changed to `result.insertedId` |
| `issueController.js` | Missing `await` on `Issue.find()` | Added `await` |
| `issueController.js` | Missing `await` on `findByIdAndDelete()` | Added `await` |
| `issueController.js` | `getAllIssues` ignores repo ID param | Fixed query to use `repository: id` |
| `authMiddleware.js` | **Completely empty** | Implemented full JWT verification |
| `authorizeMiddleware.js` | **Completely empty** | Implemented ownership checks |
| `IssueSchema` | `timestamps: true` inside fields | Moved to schema options (2nd arg) |
| `App.jsx` | Default Vite template | Wired to routing |
| `main.jsx` | Missing `<AuthProvider>` | Added AuthProvider wrapper |
| `aws-config.js` | No env vars, hardcoded bucket | Uses `process.env.*` |
| Routes | No auth protection anywhere | All write routes protected |

---

## 📁 Project Structure

```
github-clone/
├── backend/
│   ├── config/
│   │   └── aws-config.js
│   ├── controllers/
│   │   ├── git/               ← CLI git commands
│   │   │   ├── init.js
│   │   │   ├── add.js
│   │   │   ├── commit.js
│   │   │   ├── push.js
│   │   │   ├── pull.js
│   │   │   ├── revert.js
│   │   │   ├── log.js
│   │   │   └── status.js
│   │   ├── userController.js
│   │   ├── repoController.js
│   │   └── issueController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     ← JWT verification
│   │   ├── authorizeMiddleware.js ← Ownership checks
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── repoModel.js
│   │   └── issueModel.js
│   ├── routes/
│   │   ├── user.router.js
│   │   ├── repo.router.js
│   │   ├── issue.router.js
│   │   └── main.router.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   ├── Signup.jsx
    │   │   │   └── auth.css
    │   │   ├── dashboard/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Dashboard.css
    │   │   │   ├── Explore.jsx
    │   │   │   └── Explore.css
    │   │   ├── repository/
    │   │   │   ├── RepoDetail.jsx
    │   │   │   ├── RepoDetail.css
    │   │   │   ├── CreateRepo.jsx
    │   │   │   └── CreateRepo.css
    │   │   ├── issues/
    │   │   │   ├── Issues.jsx
    │   │   │   ├── Issues.css
    │   │   │   ├── IssueDetail.jsx
    │   │   │   └── IssueDetail.css
    │   │   ├── user/
    │   │   │   ├── Profile.jsx
    │   │   │   ├── Profile.css
    │   │   │   └── UserPublicProfile.jsx
    │   │   └── shared/
    │   │       ├── Navbar.jsx
    │   │       ├── Navbar.css
    │   │       ├── RepoCard.jsx
    │   │       └── RepoCard.css
    │   ├── context/
    │   │   └── authContext.jsx
    │   ├── utils/
    │   │   └── api.js            ← Centralized axios with JWT
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.jsx
    │   ├── Routes.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- AWS S3 bucket (optional, for git push/pull CLI)

### Backend

```bash
cd backend
npm install

# Copy and fill in env vars
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET_KEY, etc.

npm run dev        # dev with nodemon
# or
npm start          # production
```

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3002/api

npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🛠 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/signup` | — | Register |
| POST | `/api/login` | — | Login |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | — | List users |
| GET | `/api/users/:id` | — | Get profile |
| PUT | `/api/users/:id` | ✅ Self | Update profile |
| DELETE | `/api/users/:id` | ✅ Self | Delete account |
| POST | `/api/users/:id/follow` | ✅ | Follow/unfollow |
| GET | `/api/users/:id/contributions` | — | Heatmap data |

### Repositories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/repos` | — | List repos (search/filter) |
| POST | `/api/repos` | ✅ | Create repo |
| GET | `/api/repos/:id` | — | Get repo |
| PUT | `/api/repos/:id` | ✅ Owner | Update repo |
| DELETE | `/api/repos/:id` | ✅ Owner | Delete repo |
| POST | `/api/repos/:id/star` | ✅ | Toggle star |
| POST | `/api/repos/:id/fork` | ✅ | Fork repo |
| GET | `/api/repos/:id/branches` | — | List branches |
| POST | `/api/repos/:id/branches` | ✅ | Create branch |
| GET | `/api/repos/:id/files` | — | Get files |
| POST | `/api/repos/:id/files` | ✅ | Upload file |
| DELETE | `/api/repos/:id/files/:path` | ✅ | Delete file |
| GET | `/api/repos/:id/commits` | — | Commit history |

### Issues
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/repos/:id/issues` | — | List issues |
| POST | `/api/repos/:id/issues` | ✅ | Create issue |
| GET | `/api/issues/:id` | — | Get issue |
| PUT | `/api/issues/:id` | ✅ | Update issue |
| DELETE | `/api/issues/:id` | ✅ | Delete issue |
| POST | `/api/issues/:id/comments` | ✅ | Add comment |
| DELETE | `/api/issues/:id/comments/:cid` | ✅ | Delete comment |

---

## 💡 Interview Talking Points

1. **JWT Authentication** — Stateless, signed tokens with expiry, attached via Authorization header
2. **Role-based Authorization** — Middleware checks repo ownership before write operations
3. **Real-time with Socket.IO** — Issues/comments emit events to repo room subscribers
4. **MongoDB Schema Design** — Embedded documents (commits, files) vs referenced (owner, issues)
5. **Rate Limiting** — Protects auth endpoints from brute force
6. **Error Handling** — Global Express error handler, Axios interceptors on frontend
7. **S3 Integration** — CLI push/pull stores commits as versioned S3 objects
8. **Contribution Heatmap** — Map-based aggregation updated on each commit/repo create
