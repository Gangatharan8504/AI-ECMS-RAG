import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, Eye, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { listAgentWorkflows } from "../../services/api";
import "./AgentPages.css";

function WorkflowHistoryPage() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await listAgentWorkflows();
        if (res.success) setWorkflows(res.workflows || []);
      } catch (err) {
        console.error("Fetch history error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="agent-page-container">
      <div className="agent-page-header">
        <div>
          <div className="agent-badge-pill">
            <History size={13} />
            <span>AUDIT TRAIL</span>
          </div>
          <h1>Workflow Execution History</h1>
          <p>
            Complete historical record of all multi-agent content pipelines, reviewer decisions, and timestamps.
          </p>
        </div>
      </div>

      <div className="agent-card">
        {loading ? (
          <div className="agent-loading">Loading historical workflows...</div>
        ) : workflows.length === 0 ? (
          <div className="agent-empty-box">
            <h4>No workflow history available</h4>
            <p>Initiate a new product workflow to begin tracking history.</p>
          </div>
        ) : (
          <div className="agent-table-wrapper">
            <table className="agent-table">
              <thead>
                <tr>
                  <th>Product & Title</th>
                  <th>Objective</th>
                  <th>Language</th>
                  <th>Compliance</th>
                  <th>Approval Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf) => (
                  <tr key={wf.id}>
                    <td>
                      <strong>{wf.draft_title || wf.product_name}</strong>
                      <span className="sub-text">{wf.product_category || "General"}</span>
                    </td>
                    <td>{wf.content_objective || "Launch"}</td>
                    <td>{wf.localization_target_language || "English"}</td>
                    <td>
                      <span className={`compliance-tag sm ${wf.compliance_status?.toLowerCase()}`}>
                        {wf.compliance_status || "PENDING"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag ${wf.approval_status.toLowerCase()}`}>
                        {wf.approval_status}
                      </span>
                    </td>
                    <td>{wf.created_at?.slice(0, 16)}</td>
                    <td>
                      <button
                        className="agent-btn secondary sm"
                        onClick={() => navigate(`/agents/approval?id=${wf.id}`)}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowHistoryPage;
