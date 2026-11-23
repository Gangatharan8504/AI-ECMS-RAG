import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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
  PanelLeftOpen,
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`agent-sidebar-container ${isOpen ? "open" : "collapsed"}`}>
      {/* TRIGGER BUTTON (Sits right on the bottom or edge of primary sidebar) */}
      <button
        className="agent-sidebar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Collapse Agent Studio" : "Open Multi-Agent Studio"}
      >
        <div className="trigger-icon-wrap">
          <Sparkles size={16} className="sparkle-pulse" />
        </div>
        <div className="trigger-text">
          <span className="trigger-badge">NEW</span>
          <strong>Multi-Agent Studio</strong>
        </div>
        {isOpen ? <PanelLeftClose size={16} /> : <ChevronRight size={16} className="arrow-pulse" />}
      </button>

      {/* DEDICATED AGENT WORKFLOW SIDEBAR */}
      <aside className={`agent-sidebar ${isOpen ? "expanded" : ""}`}>
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
            onClick={() => setIsOpen(false)}
            title="Minimize"
          >
            <PanelLeftClose size={17} />
          </button>
        </div>

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
      </aside>
    </div>
  );
}

export default AgentSidebar;
