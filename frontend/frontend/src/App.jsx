import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

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

const App = () => {
  return (
    <BrowserRouter>
      {/* AMBIENT LOTTIE BACKGROUND */}
      <LottieBackground />

      <Routes>

        {/* =========================
            AUTHENTICATION
        ========================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            MAIN APPLICATION
        ========================== */}

        <Route
          path="/*"
          element={
            <div className="app-layout">

              {/* SIDEBAR */}

              <Sidebar />


              {/* MAIN CONTENT */}

              <main className="main-content">

                <div className="main-content-inner">

                  <Routes>

                    <Route
                      path="/"
                      element={<Dashboard />}
                    />

                    <Route
                      path="/documents"
                      element={<Documents />}
                    />

                    <Route
                      path="/assistant"
                      element={<Assistant />}
                    />

                    <Route
                      path="/insights"
                      element={<Insights />}
                    />

                    <Route
                      path="/translation"
                      element={<Translation />}
                    />

                    <Route
                      path="/review"
                      element={<ContentReview />}
                    />

                    <Route
                      path="/settings"
                      element={<Settings />}
                    />

                  </Routes>

                </div>

              </main>

            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
};

export default App;