import {
  User,
  Bell,
  ShieldCheck,
  Palette,
  Volume2,
  Languages,
  Save,
  Moon,
  Sun,
  CheckCircle2,
  Lock,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import "./Settings.css";

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    fullName: user?.name || "Alex",
    role: user?.role || "Student",
    email: user?.email || "alex@college.edu",
    language: "English",
    notifications: true,
    emailNotifications: true,
    voiceLanguage: "English",
    autoSpeak: false,
  });

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        role: user.role || prev.role,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      "ai_ecms_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="settings-page">

      {/* HEADER */}

      <div className="settings-header">
        <div>
          <p className="settings-eyebrow">
            WORKSPACE SETTINGS
          </p>

          <h1>Settings</h1>

          <p>
            Manage your AI ECMS workspace preferences and account settings.
          </p>
        </div>

        <button
          className="settings-save-button"
          onClick={handleSave}
        >
          <Save size={15} />

          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>


      {/* PROFILE */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <User size={18} />
          </div>

          <div>
            <h2>Profile</h2>
            <p>Your AI ECMS account information</p>
          </div>

        </div>

        <div className="settings-divider" />

        <div className="settings-profile">

          <div className="profile-avatar">
            {(settings.fullName || "Alex").charAt(0).toUpperCase()}
          </div>

          <div className="profile-main">

            <div className="profile-name-row">

              <strong>
                {settings.fullName}
              </strong>

              <span className="profile-role">
                {settings.role}
              </span>

            </div>

            <span className="profile-email">
              {settings.email || "Email not configured"}
            </span>

          </div>

        </div>

        <div className="settings-form-grid">

          <div className="settings-field">

            <label>
              Full Name
            </label>

            <input
              type="text"
              value={settings.fullName}
              onChange={(event) =>
                updateSetting(
                  "fullName",
                  event.target.value
                )
              }
            />

          </div>


          <div className="settings-field">

            <label>
              Role
            </label>

            <input
              type="text"
              value={settings.role}
              disabled
            />

          </div>


          <div className="settings-field">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={settings.email}
              onChange={(event) =>
                updateSetting(
                  "email",
                  event.target.value
                )
              }
            />

          </div>

        </div>

      </section>


      {/* APPEARANCE */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Palette size={18} />
          </div>

          <div>
            <h2>Appearance</h2>
            <p>Customize how AI ECMS looks</p>
          </div>

        </div>

        <div className="settings-divider" />

        <div className="appearance-options">

          {/* LIGHT */}

          <button
            className={`appearance-option ${
              theme === "light" ? "active" : ""
            }`}
            onClick={() => {
              if (theme === "dark") {
                toggleTheme();
              }
            }}
          >

            <div className="appearance-icon">
              <Sun size={18} />
            </div>

            <div>
              <strong>
                Light Mode
              </strong>

              <span>
                Clean and bright workspace
              </span>
            </div>

            {theme === "light" && (
              <CheckCircle2 size={17} />
            )}

          </button>


          {/* DARK */}

          <button
            className={`appearance-option ${
              theme === "dark" ? "active" : ""
            }`}
            onClick={() => {
              if (theme === "light") {
                toggleTheme();
              }
            }}
          >

            <div className="appearance-icon">
              <Moon size={18} />
            </div>

            <div>
              <strong>
                Dark Mode
              </strong>

              <span>
                Comfortable dark workspace
              </span>
            </div>

            {theme === "dark" && (
              <CheckCircle2 size={17} />
            )}

          </button>

        </div>

      </section>


      {/* AI PREFERENCES */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Languages size={18} />
          </div>

          <div>
            <h2>AI Preferences</h2>
            <p>Configure language and voice behaviour</p>
          </div>

        </div>

        <div className="settings-divider" />

        <div className="settings-form-grid">

          <div className="settings-field">

            <label>
              Interface Language
            </label>

            <select
              value={settings.language}
              onChange={(event) =>
                updateSetting(
                  "language",
                  event.target.value
                )
              }
            >
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
              <option>Telugu</option>
              <option>Malayalam</option>
              <option>Kannada</option>
            </select>

          </div>


          <div className="settings-field">

            <label>
              Voice Language
            </label>

            <select
              value={settings.voiceLanguage}
              onChange={(event) =>
                updateSetting(
                  "voiceLanguage",
                  event.target.value
                )
              }
            >
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
              <option>Telugu</option>
              <option>Malayalam</option>
              <option>Kannada</option>
            </select>

          </div>

        </div>


        <div className="settings-toggle-list">

          <div className="settings-toggle-row">

            <div className="toggle-icon">
              <Volume2 size={17} />
            </div>

            <div className="toggle-content">

              <strong>
                Auto Voice Playback
              </strong>

              <span>
                Automatically read AI responses when supported.
              </span>

            </div>

            <button
              className={`toggle ${
                settings.autoSpeak ? "on" : ""
              }`}
              onClick={() =>
                updateSetting(
                  "autoSpeak",
                  !settings.autoSpeak
                )
              }
            >
              <span />
            </button>

          </div>

        </div>

      </section>


      {/* NOTIFICATIONS */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Bell size={18} />
          </div>

          <div>
            <h2>Notifications</h2>
            <p>Control important workspace notifications</p>
          </div>

        </div>

        <div className="settings-divider" />

        <div className="settings-toggle-list">

          <div className="settings-toggle-row">

            <div className="toggle-icon">
              <Bell size={17} />
            </div>

            <div className="toggle-content">

              <strong>
                Workspace Notifications
              </strong>

              <span>
                Receive updates about document processing and AI tasks.
              </span>

            </div>

            <button
              className={`toggle ${
                settings.notifications ? "on" : ""
              }`}
              onClick={() =>
                updateSetting(
                  "notifications",
                  !settings.notifications
                )
              }
            >
              <span />
            </button>

          </div>


          <div className="settings-toggle-row">

            <div className="toggle-icon">
              <ShieldCheck size={17} />
            </div>

            <div className="toggle-content">

              <strong>
                Email Notifications
              </strong>

              <span>
                Receive important account and workflow updates.
              </span>

            </div>

            <button
              className={`toggle ${
                settings.emailNotifications ? "on" : ""
              }`}
              onClick={() =>
                updateSetting(
                  "emailNotifications",
                  !settings.emailNotifications
                )
              }
            >
              <span />
            </button>

          </div>

        </div>

      </section>


      {/* SECURITY */}

      <section className="settings-card security-card">

        <div className="settings-card-header">

          <div className="settings-section-icon">
            <Lock size={18} />
          </div>

          <div>
            <h2>Security</h2>
            <p>Account security and authentication</p>
          </div>

        </div>

        <div className="settings-divider" />

        <div className="security-info">

          <ShieldCheck size={20} />

          <div>
            <strong>
              Secure Account
            </strong>

            <span>
              Authentication and user-specific document access
              will be managed by the FastAPI backend.
            </span>
          </div>

          <span className="security-status">
            Ready
          </span>

        </div>

      </section>

    </div>
  );
}

export default Settings;