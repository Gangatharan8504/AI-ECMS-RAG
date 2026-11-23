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
import AgentSidebar from "./components/AgentSidebar";

import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Assistant from "./pages/Assistant";
import Insights from "./pages/Insights";
import Translation from "./pages/Translation";
import ContentReview from "./pages/ContentReview";
import Settings from "./pages/Settings";

import Register from "./pages/Register";
import Login from "./pages/Login";

/* MULTI-AGENT CONTENT AUTOMATION PAGES */
import AgentDashboard from "./pages/agents/AgentDashboard";
import ProductInputPage from "./pages/agents/ProductInputPage";
import HumanApprovalDashboard from "./pages/agents/HumanApprovalDashboard";
import ComplianceSettingsPage from "./pages/agents/ComplianceSettingsPage";
import PublishingManagementPage from "./pages/agents/PublishingManagementPage";
import WorkflowHistoryPage from "./pages/agents/WorkflowHistoryPage";

import LottieBackground from "./components/LottieBackground";
import "./App.css";

/* ===================================================
   PROTECTED ROUTE
   Redirects unauthenticated users to /login
=================================================== */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      {/* 1. ORIGINAL CORE SIDEBAR */}
      <Sidebar />

      {/* 2. DEDICATED NEW MULTI-AGENT STUDIO SIDEBAR (CLEAN SEPARATION) */}
      <AgentSidebar />

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/* ===================================================
   PUBLIC ROUTE
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
        {/* PUBLIC — Auth pages */}
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

        {/* PROTECTED — App pages */}
        <Route element={<ProtectedRoute />}>
          {/* CORE ECMS ROUTES */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/translation" element={<Translation />} />
          <Route path="/review" element={<ContentReview />} />
          <Route path="/settings" element={<Settings />} />

          {/* NEW MULTI-AGENT CONTENT AUTOMATION ROUTES */}
          <Route path="/agents" element={<AgentDashboard />} />
          <Route path="/agents/product" element={<ProductInputPage />} />
          <Route path="/agents/generation" element={<ProductInputPage />} />
          <Route path="/agents/draft" element={<HumanApprovalDashboard />} />
          <Route path="/agents/review" element={<HumanApprovalDashboard />} />
          <Route path="/agents/localization" element={<HumanApprovalDashboard />} />
          <Route path="/agents/compliance" element={<HumanApprovalDashboard />} />
          <Route path="/agents/approval" element={<HumanApprovalDashboard />} />
          <Route path="/agents/publishing" element={<PublishingManagementPage />} />
          <Route path="/agents/analytics" element={<AgentDashboard />} />
          <Route path="/agents/history" element={<WorkflowHistoryPage />} />
          <Route path="/agents/settings" element={<ComplianceSettingsPage />} />

          {/* Catch-all: redirect unknown paths to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
