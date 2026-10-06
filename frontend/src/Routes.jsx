import React, { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { useAuth } from "./context/authContext";

import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import RepoDetail from "./components/repository/RepoDetail";
import CreateRepo from "./components/repository/CreateRepo";
import Issues from "./components/issues/Issues";
import IssueDetail from "./components/issues/IssueDetail";
import Explore from "./components/dashboard/Explore";
import UserPublicProfile from "./components/user/UserPublicProfile";
import Landing from "./components/landing/Landing";

const PUBLIC_PATHS = ["/", "/auth", "/signup", "/explore"];

const HomePage = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return currentUser ? <Dashboard /> : <Landing />;
};

const ProtectedRoute = ({ element }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/auth");
    }
  }, [currentUser, loading, navigate]);

  if (loading) return <div className="loading-screen">Loading...</div>;
  return currentUser ? element : null;
};

const ProjectRoutes = () => {
  const { currentUser, setCurrentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && !currentUser) {
      setCurrentUser({ id: userId, username: localStorage.getItem("username") });
    }
    if (
      !loading &&
      !userId &&
      !PUBLIC_PATHS.includes(window.location.pathname)
    ) {
      navigate("/auth");
    }
    if (userId && ["/auth", "/signup"].includes(window.location.pathname)) {
      navigate("/");
    }
  }, [currentUser, navigate, setCurrentUser, loading]);

  const routes = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/auth", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/profile", element: <ProtectedRoute element={<Profile />} /> },
    { path: "/explore", element: <Explore /> },
    { path: "/new", element: <ProtectedRoute element={<CreateRepo />} /> },
    { path: "/repos/:id", element: <RepoDetail /> },
    { path: "/repos/:id/issues", element: <Issues /> },
    { path: "/repos/:id/issues/:issueId", element: <IssueDetail /> },
    { path: "/users/:username", element: <UserPublicProfile /> },
    { path: "*", element: <div style={{ textAlign: "center", padding: "4rem", color: "white" }}><h1>404 - Page Not Found</h1></div> },
  ]);

  return routes;
};

export default ProjectRoutes;
