import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  FilePlus,
  Wand2,
  FileEdit,
  CheckCheck,
  Languages,
  ShieldCheck,
  UserCheck,
  Share2,
  BarChart3,
  History,
  Sliders,
  PanelLeftClose,
} from "lucide-react";
import "./AgentSidebar.css";

const AGENT_NAV_ITEMS = [
  { path: "/agents", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/agents/product", label: "Product Details", icon: FilePlus },
  { path: "/agents/generation", label: "Content Generation", icon: Wand2 },
  { path: "/agents/draft", label: "Draft Agent", icon: FileEdit },
  { path: "/agents/review", label: "Review Agent", icon: CheckCheck },
  { path: "/agents/localization", label: "Localization Agent", icon: Languages },
  { path: "/agents/compliance", label: "Compliance Agent", icon: ShieldCheck },
  { path: "/agents/approval", label: "Human Approval", icon: UserCheck },
  { path: "/agents/publishing", label: "Publishing", icon: Share2 },
  { path: "/agents/analytics", label: "Content Analytics", icon: BarChart3 },
  { path: "/agents/history", label: "Workflow History", icon: History },
  { path: "/agents/settings", label: "Agent Settings", icon: Sliders },
];

function AgentSidebar() {
  const location = useLocation();
  // Automatically open when navigating to any /agents route
  const isAgentRoute = location.pathname.startsWith("/agents");
  const [collapsed, setCollapsed] = useState(false);

  // If user is on standard ECMS routes (/documents, /assistant, etc.), do NOT show agent sidebar
  if (!isAgentRoute) {
    return null;
  }

  return (
    <div className={`agent-sidebar-container ${collapsed ? "collapsed" : "expanded"}`}>
      <aside className={`agent-sidebar ${collapsed ? "" : "expanded"}`}>
        <div className="agent-sidebar-header">
          <div className="agent-brand">
            <div className="agent-brand-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>Agent Studio</h3>
              <span>Autonomous Content Engine</span>
            </div>
          </div>
          <button
            className="agent-close-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Studio Nav" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        {!collapsed && (
          <>
            <div className="agent-nav-list">
              <div className="agent-nav-category">PIPELINE WORKFLOW</div>
              {AGENT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `agent-nav-item ${isActive ? "active" : ""}`
                    }
                  >
                    <div className="agent-icon-box">
                      <Icon size={16} />
                    </div>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="agent-sidebar-footer">
              <div className="pipeline-status-badge">
                <span className="pipeline-dot"></span>
                <span>Agent Engine v2.0 Ready</span>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

export default AgentSidebar;
