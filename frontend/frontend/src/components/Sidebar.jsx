import {
  Brain,
  FileText,
  MessageSquare,
  Languages,
  ClipboardCheck,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* =================================================
          MOBILE TOP BAR
      ================================================= */}

      <div className="mobile-topbar">

        <button
          className="mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            🎓
          </div>

          <div>
            <strong>AI ECMS</strong>
            <span>College Content AI</span>
          </div>
        </div>

      </div>


      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileMenu}
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >

        {/* MOBILE CLOSE BUTTON */}

        <button
          className="mobile-close-button"
          onClick={closeMobileMenu}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>


        {/* =================================================
            BRAND
        ================================================= */}

        <div className="brand">

          <div className="brand-icon">
            🎓
          </div>

          <div className="brand-text">

            <h2>AI ECMS</h2>

            <span>
              College Content AI
            </span>

          </div>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="nav-section">

          <p className="nav-title">
            MAIN
          </p>


          <NavLink
            to="/"
            end
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Brain size={18} />

            <span>
              Dashboard
            </span>
          </NavLink>


          <NavLink
            to="/documents"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <FileText size={18} />

            <span>
              Documents
            </span>
          </NavLink>


          <NavLink
            to="/assistant"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <MessageSquare size={18} />

            <span>
              AI Assistant
            </span>
          </NavLink>


          <NavLink
            to="/insights"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Brain size={18} />

            <span>
              AI Insights
            </span>
          </NavLink>


          <p className="nav-title">
            CONTENT
          </p>


          <NavLink
            to="/translation"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Languages size={18} />

            <span>
              Translation
            </span>
          </NavLink>


          <NavLink
            to="/review"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <ClipboardCheck size={18} />

            <span>
              Content Review
            </span>
          </NavLink>

        </div>


        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="sidebar-bottom">

          {/* THEME */}

          <button
            className="theme-toggle"
            onClick={toggleTheme}
          >

            <div className="theme-toggle-icon">

              {theme === "dark" ? (
                <Moon size={16} />
              ) : (
                <Sun size={16} />
              )}

            </div>

            <div className="theme-text">

              <strong>
                {theme === "dark"
                  ? "Dark Mode"
                  : "Light Mode"}
              </strong>

              <span>
                Switch appearance
              </span>

            </div>

          </button>


          {/* SETTINGS */}

          <NavLink
            to="/settings"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <SettingsIcon size={18} />

            <span>
              Settings
            </span>
          </NavLink>


          {/* PROFILE */}

          <div className="profile">

            <div className="avatar">
              {(user?.name || "Alex").charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">

              <strong>
                {user?.name || "Alex"}
              </strong>

              <span>
                {user?.role || "Student"}
              </span>

            </div>

            <button
              className="logout-button"
              title="Logout"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;