import React, { useState, useEffect } from "react";
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
} from "lucide-react";
import { listPlatforms, connectPlatform, listAgentWorkflows } from "../../services/api";
import "./AgentPages.css";

function PublishingManagementPage() {
  const [platforms, setPlatforms] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectModal, setConnectModal] = useState(null);
  const [accountInput, setAccountInput] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [platRes, wfRes] = await Promise.all([
        listPlatforms(),
        listAgentWorkflows(),
      ]);
      if (platRes.success) setPlatforms(platRes.platforms || []);
      if (wfRes.success) setWorkflows(wfRes.workflows || []);
    } catch (err) {
      console.error("Fetch publishing data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!connectModal || !accountInput.trim()) return;
    try {
      await connectPlatform(connectModal.platform_id, accountInput.trim());
      setConnectModal(null);
      setAccountInput("");
      fetchData();
    } catch (err) {
      alert("Connection failed.");
    }
  };

  const publishedWorkflows = workflows.filter((w) => w.publishing_status === "PUBLISHED");

  return (
    <div className="agent-page-container">
      <div className="agent-page-header">
        <div>
          <div className="agent-badge-pill">
            <Share2 size={13} />
            <span>STAGE 7: SYNDICATION & PLATFORMS</span>
          </div>
          <h1>Publishing Agent & Platform Channels</h1>
          <p>
            Manage social and web channel API authentications, live syndication statuses, and audit logs.
          </p>
        </div>
      </div>

      <div className="agent-two-col-grid">
        {/* PLATFORMS CONFIGURATION */}
        <div className="agent-card">
          <div className="agent-card-header">
            <h3>Connected Publishing Channels</h3>
            <button className="agent-btn secondary sm" onClick={fetchData}>
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="platforms-list">
            {platforms.map((p) => (
              <div key={p.platform_id} className="platform-row-item">
                <div className="platform-info">
                  <strong>{p.platform_name}</strong>
                  <span className={p.is_connected ? "text-emerald" : "text-amber"}>
                    {p.is_connected ? `Connected (${p.account_name})` : "Account Not Connected"}
                  </span>
                </div>

                <div>
                  {p.is_connected ? (
                    <span className="connected-pill">Active ✓</span>
                  ) : (
                    <button
                      className="agent-btn primary sm"
                      onClick={() => {
                        setConnectModal(p);
                        setAccountInput("");
                      }}
                    >
                      Connect Account
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE SYNDICATED POSTS */}
        <div className="agent-card">
          <div className="agent-card-header">
            <h3>Recent Published Content</h3>
          </div>

          {publishedWorkflows.length === 0 ? (
            <div className="agent-empty-box">
              <Share2 size={24} className="empty-sparkle" />
              <h4>No content published yet</h4>
              <p>Approved workflows can be dispatched to connected platforms.</p>
            </div>
          ) : (
            <div className="published-feed">
              {publishedWorkflows.map((pw) => (
                <div key={pw.id} className="published-feed-item">
                  <strong>{pw.draft_title}</strong>
                  <p>{pw.draft_short_description}</p>
                  <div className="feed-meta">
                    <span className="live-tag">LIVE</span>
                    <span>Published: {pw.published_at?.slice(0, 16)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONNECT MODAL */}
      {connectModal && (
        <div className="agent-modal-backdrop">
          <div className="agent-modal-card">
            <h3>Connect {connectModal.platform_name}</h3>
            <p>
              Provide account identifier or OAuth client name to enable automated publishing.
            </p>
            <form onSubmit={handleConnect}>
              <div className="form-group">
                <label>Account Handle / Profile Identifier:</label>
                <input
                  type="text"
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  placeholder="e.g. @company_official or Page ID"
                  required
                />
              </div>
              <div className="form-submit-row">
                <button
                  type="button"
                  className="agent-btn secondary"
                  onClick={() => setConnectModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="agent-btn primary">
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublishingManagementPage;
