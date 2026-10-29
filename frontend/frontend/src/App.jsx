import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Assistant from "./pages/Assistant";
import Insights from "./pages/Insights";
import Translation from "./pages/Translation";
import ContentReview from "./pages/ContentReview";
import Settings from "./pages/Settings";

import Register from "./pages/Register";
import Login from "./pages/Login";

import LottieBackground from "./components/LottieBackground";
import "./App.css";

/* ===================================================
   PROTECTED ROUTE
   Redirects unauthenticated users to /login
=================================================== */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Pass current location so after login we can redirect back
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="main-content-inner">
          {/* Outlet renders the matched child route */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/* ===================================================
   PUBLIC ROUTE
   Redirects already-logged-in users away from /login
=================================================== */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

/* ===================================================
   APP
=================================================== */
const App = () => {
  return (
    <BrowserRouter>
      {/* AMBIENT LOTTIE BACKGROUND */}
      <LottieBackground />

      <Routes>

        {/* =========================
            PUBLIC — Auth pages
        ========================== */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* =========================
            PROTECTED — App pages
        ========================== */}

        <Route element={<ProtectedRoute />}>

          <Route path="/"          element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/insights"  element={<Insights />} />
          <Route path="/translation" element={<Translation />} />
          <Route path="/review"    element={<ContentReview />} />
          <Route path="/settings"  element={<Settings />} />

          {/* Catch-all: redirect unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
