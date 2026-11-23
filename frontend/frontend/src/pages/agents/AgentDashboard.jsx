import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  Share2,
  TrendingUp,
  ArrowRight,
  Plus,
  Zap,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { listAgentWorkflows, getContentIntelligence } from "../../services/api";
import WorkflowTracker from "../../components/WorkflowTracker";
import "./AgentPages.css";

function AgentDashboard() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wfRes, intRes] = await Promise.all([
        listAgentWorkflows(),
        getContentIntelligence(),
      ]);
      if (wfRes.success) setWorkflows(wfRes.workflows || []);
      if (intRes.success) setIntelligence(intRes.data || null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const metrics = intelligence?.metrics || {
    total_generated: workflows.length,
    awaiting_approval: workflows.filter((w) => w.approval_status === "PENDING").length,
    approved: workflows.filter((w) => w.approval_status === "APPROVED").length,
    published: workflows.filter((w) => w.publishing_status === "PUBLISHED").length,
    rejected: workflows.filter((w) => w.approval_status === "REJECTED").length,
    avg_processing_time_ms: 1250,
  };

  const insights = intelligence?.insights;
  const latestWorkflow = workflows[0];

  return (
    <div className="agent-page-container">
      {/* HEADER */}
      <div className="agent-page-header">
        <div>
          <div className="agent-badge-pill">
            <Zap size={13} />
            <span>AUTONOMOUS PIPELINE</span>
          </div>
          <h1>Multi-Agent Content Automation</h1>
          <p>
            Coordinated Draft, Review, Localization, Compliance, and Publishing agent network.
          </p>
        </div>
        <div className="agent-header-actions">
          <button className="agent-btn secondary" onClick={fetchData} title="Refresh">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button className="agent-btn primary" onClick={() => navigate("/agents/product")}>
            <Plus size={16} />
            <span>New Content Pipeline</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="agent-metrics-grid">
        <div className="agent-metric-card">
          <div className="metric-icon indigo">
            <FileText size={20} />
          </div>
          <div>
            <span className="metric-title">Total Workflows</span>
            <strong className="metric-num">{metrics.total_generated}</strong>
          </div>
        </div>

        <div className="agent-metric-card">
          <div className="metric-icon amber">
            <Clock size={20} />
          </div>
          <div>
            <span className="metric-title">Awaiting Approval</span>
            <strong className="metric-num">{metrics.awaiting_approval}</strong>
          </div>
        </div>

        <div className="agent-metric-card">
          <div className="metric-icon emerald">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="metric-title">Approved Content</span>
            <strong className="metric-num">{metrics.approved}</strong>
          </div>
        </div>

        <div className="agent-metric-card">
          <div className="metric-icon blue">
            <Share2 size={20} />
          </div>
          <div>
            <span className="metric-title">Published</span>
            <strong className="metric-num">{metrics.published}</strong>
          </div>
        </div>
      </div>

      {/* ACTIVE WORKFLOW TRACKER PREVIEW */}
      {latestWorkflow && (
        <WorkflowTracker
          currentStage={latestWorkflow.current_stage}
          status={latestWorkflow.approval_status}
        />
      )}

      {/* TWO COLUMN GRID: AI STRATEGY & RECENT WORKFLOWS */}
      <div className="agent-two-col-grid">
        {/* RECENT AGENT PIPELINES */}
        <div className="agent-card">
          <div className="agent-card-header">
            <h3>Recent Automated Pipelines</h3>
            <button className="text-link-btn" onClick={() => navigate("/agents/history")}>
              View History <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="agent-loading">Loading agent pipelines...</div>
          ) : workflows.length === 0 ? (
            <div className="agent-empty-box">
              <Sparkles size={28} className="empty-sparkle" />
              <h4>No automated content generated yet</h4>
              <p>Start a new workflow to draft, review, localize, and publish content.</p>
              <button
                className="agent-btn primary sm"
                onClick={() => navigate("/agents/product")}
              >
                Start Product Workflow
              </button>
            </div>
          ) : (
            <div className="agent-workflow-list">
              {workflows.slice(0, 5).map((wf) => (
                <div
                  key={wf.id}
                  className="agent-workflow-item"
                  onClick={() => navigate(`/agents/approval?id=${wf.id}`)}
                >
                  <div className="wf-main-info">
                    <strong>{wf.draft_title || wf.product_name}</strong>
                    <span>
                      {wf.product_category || "General"} • {wf.content_objective || "Campaign"}
                    </span>
                  </div>
                  <div className="wf-meta">
                    <span className={`status-tag ${wf.approval_status.toLowerCase()}`}>
                      {wf.approval_status}
                    </span>
                    <span className="timestamp">{wf.created_at?.slice(0, 16)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI CONTENT STRATEGY & INTELLIGENCE */}
        <div className="agent-card strategy-card">
          <div className="agent-card-header">
            <div className="header-with-badge">
              <TrendingUp size={18} className="text-indigo" />
              <h3>AI Content Intelligence</h3>
            </div>
            <span className="ai-live-tag">Online Strategy</span>
          </div>

          <div className="intelligence-body">
            <div className="strategy-item">
              <span className="strategy-label">Optimal Posting Windows</span>
              <p>{insights?.best_posting_times || "Tuesday & Thursday 10:00 AM - 1:00 PM for Website & LinkedIn."}</p>
            </div>

            <div className="strategy-item">
              <span className="strategy-label">Content Structure Recommendation</span>
              <p>{insights?.content_format_recommendations || "Incorporate numbered benefit lists in draft intros to boost reader retention."}</p>
            </div>

            <div className="strategy-item">
              <span className="strategy-label">Audience Targeting Strategy</span>
              <p>{insights?.audience_targeting || "Align technical specifications with quantifiable metrics for enterprise buyers."}</p>
            </div>

            <div className="strategy-item">
              <span className="strategy-label">Pipeline Velocity Optimization</span>
              <p>{insights?.workflow_velocity_strategy || "Pre-compliance automated audits accelerate human manager approvals by 45%."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;
