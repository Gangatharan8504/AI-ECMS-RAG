import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Wand2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Share2,
  Languages,
  ShieldCheck,
  FileText,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import {
  getWorkflowDetails,
  listAgentWorkflows,
  submitManagerApproval,
  publishAgentContent,
} from "../../services/api";
import WorkflowTracker from "../../components/WorkflowTracker";
import "./AgentPages.css";

function HumanApprovalDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workflowIdParam = searchParams.get("id");

  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflowIdParam || "");
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [managerComments, setManagerComments] = useState("");
  const [selectedChannels, setSelectedChannels] = useState(["website"]);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState("");
  const [publishResults, setPublishResults] = useState(null);

  // Fetch list of workflows
  const fetchWorkflows = async () => {
    try {
      const res = await listAgentWorkflows();
      if (res.success && res.workflows.length > 0) {
        setWorkflows(res.workflows);
        if (!selectedWorkflowId) {
          setSelectedWorkflowId(res.workflows[0].id);
        }
      }
    } catch (err) {
      console.error("List workflows error:", err);
    }
  };

  // Fetch details of selected workflow
  const fetchDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    setPublishSuccessMessage("");
    setPublishResults(null);
    try {
      const res = await getWorkflowDetails(id);
      if (res.success) {
        setWorkflow(res.workflow);
        setManagerComments(res.workflow.approval_comments || "");
      }
    } catch (err) {
      console.error("Fetch workflow details error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflowId) {
      fetchDetails(selectedWorkflowId);
    }
  }, [selectedWorkflowId]);

  const handleDecision = async (decision) => {
    if (!workflow) return;
    setActionLoading(true);
    try {
      const res = await submitManagerApproval(
        workflow.id,
        decision,
        "Alex (Content Manager)",
        managerComments
      );
      if (res.success) {
        await fetchDetails(workflow.id);
        await fetchWorkflows();
      }
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Approval decision failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!workflow) return;
    if (selectedChannels.length === 0) {
      alert("Please select at least one publishing channel.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await publishAgentContent(workflow.id, selectedChannels);
      if (res.success) {
        setPublishSuccessMessage("Publishing task executed!");
        setPublishResults(res.data?.results || []);
        await fetchDetails(workflow.id);
        await fetchWorkflows();
      }
    } catch (err) {
      alert(err.response?.data?.detail || err.message || "Publishing failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleChannel = (ch) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  // Parse review arrays
  const grammarIssues = workflow?.review_grammar_issues ? JSON.parse(workflow.review_grammar_issues) : [];
  const unsupportedStatements = workflow?.review_unsupported_statements ? JSON.parse(workflow.review_unsupported_statements) : [];
  const reviewSuggestions = workflow?.review_suggestions ? JSON.parse(workflow.review_suggestions) : [];

  return (
    <div className="agent-page-container">
      <div className="agent-page-header">
        <div>
          <div className="agent-badge-pill">
            <CheckCircle2 size={13} />
            <span>STAGE 5 & 6: GOVERNANCE & APPROVAL</span>
          </div>
          <h1>Human-in-the-Loop Approval & Publishing</h1>
          <p>
            Audit AI draft, factual review, localized copies, and compliance results before authorizing multi-channel publishing.
          </p>
        </div>

        {/* WORKFLOW SELECTOR */}
        {workflows.length > 0 && (
          <div className="workflow-select-wrap">
            <label>Select Pipeline Run:</label>
            <select
              value={selectedWorkflowId}
              onChange={(e) => setSelectedWorkflowId(e.target.value)}
            >
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id}>
                  {wf.draft_title || wf.product_name} ({wf.approval_status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading || !workflow ? (
        <div className="agent-loading">Loading workflow details...</div>
      ) : (
        <>
          {/* PIPELINE PROGRESS BAR */}
          <WorkflowTracker
            currentStage={workflow.current_stage}
            status={workflow.approval_status}
          />

          {/* APPROVAL DECISION BAR */}
          <div className="approval-action-bar">
            <div className="approval-status-info">
              <span className="status-label">Current Pipeline Status:</span>
              <strong className={`status-badge-lg ${workflow.approval_status.toLowerCase()}`}>
                {workflow.approval_status}
              </strong>
              {workflow.approved_by && (
                <span className="reviewer-info">
                  By {workflow.approved_by} on {workflow.approved_at?.slice(0, 16)}
                </span>
              )}
            </div>

            <div className="decision-buttons">
              <button
                className="agent-btn danger sm"
                disabled={actionLoading}
                onClick={() => handleDecision("REJECTED")}
              >
                <X size={15} />
                <span>Reject</span>
              </button>

              <button
                className="agent-btn warning sm"
                disabled={actionLoading}
                onClick={() => handleDecision("MODIFICATION_REQUESTED")}
              >
                <RotateCcw size={15} />
                <span>Request Modifications</span>
              </button>

              <button
                className="agent-btn success sm"
                disabled={actionLoading || workflow.approval_status === "APPROVED"}
                onClick={() => handleDecision("APPROVED")}
              >
                <Check size={16} />
                <span>{workflow.approval_status === "APPROVED" ? "Approved ✓" : "Approve Content"}</span>
              </button>
            </div>
          </div>

          {/* MANAGER COMMENTS INPUT */}
          <div className="manager-notes-card">
            <label>Manager Audit Notes & Governance Instructions:</label>
            <input
              type="text"
              value={managerComments}
              onChange={(e) => setManagerComments(e.target.value)}
              placeholder="e.g. Approved with revised technical warranty clause."
            />
          </div>

          {/* FOUR AGENT COMPARISON TABS & SECTIONS */}
          <div className="agent-audit-grid">
            {/* 1. ORIGINAL DRAFT */}
            <div className="audit-card">
              <div className="audit-card-title">
                <Wand2 size={16} className="text-indigo" />
                <h4>1. AI Draft Agent Output</h4>
              </div>
              <div className="audit-field">
                <span className="field-name">Draft Title</span>
                <p className="field-value font-bold">{workflow.draft_title}</p>
              </div>
              <div className="audit-field">
                <span className="field-name">Short Description</span>
                <p className="field-value">{workflow.draft_short_description}</p>
              </div>
              <div className="audit-field">
                <span className="field-name">Main Marketing Content</span>
                <div className="content-scrollbox">{workflow.draft_main_content}</div>
              </div>
              <div className="audit-field">
                <span className="field-name">Social Caption & Hashtags</span>
                <p className="field-value caption-box">
                  {workflow.draft_social_caption}
                  <br />
                  <span className="hashtags">{workflow.draft_hashtags}</span>
                </p>
              </div>
            </div>

            {/* 2. REVIEW & FACTUAL AUDIT */}
            <div className="audit-card">
              <div className="audit-card-title">
                <CheckCircle2 size={16} className="text-emerald" />
                <h4>2. AI Review Agent Audit</h4>
              </div>
              <div className="audit-field">
                <span className="field-name">Quality Assessment</span>
                <p className="field-value">{workflow.review_quality_feedback}</p>
              </div>
              <div className="audit-field">
                <span className="field-name">Grammar & Style Flags</span>
                <ul className="audit-list">
                  {grammarIssues.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
              <div className="audit-field">
                <span className="field-name">Factual Consistency & Unsupported Claims</span>
                <ul className="audit-list">
                  {unsupportedStatements.map((u, idx) => (
                    <li key={idx} className="warning-item">
                      <AlertTriangle size={13} /> {u}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="audit-field">
                <span className="field-name">Polished Revised Content</span>
                <div className="content-scrollbox highlight">
                  {workflow.review_revised_content || workflow.draft_main_content}
                </div>
              </div>
            </div>

            {/* 3. LOCALIZATION AGENT */}
            <div className="audit-card">
              <div className="audit-card-title">
                <Languages size={16} className="text-blue" />
                <h4>3. AI Localization ({workflow.localization_target_language})</h4>
              </div>
              <div className="audit-field">
                <span className="field-name">Translated Title</span>
                <p className="field-value font-bold">{workflow.localization_translated_title}</p>
              </div>
              <div className="audit-field">
                <span className="field-name">Translated Main Content</span>
                <div className="content-scrollbox">{workflow.localization_translated_content}</div>
              </div>
              <div className="audit-field">
                <span className="field-name">Translated Caption</span>
                <p className="field-value caption-box">{workflow.localization_translated_caption}</p>
              </div>
            </div>

            {/* 4. COMPLIANCE AGENT */}
            <div className="audit-card">
              <div className="audit-card-title">
                <ShieldCheck size={16} className="text-purple" />
                <h4>4. Brand Compliance & Safety</h4>
              </div>
              <div className="audit-field">
                <span className="field-name">Compliance Verdict</span>
                <div className={`compliance-tag ${workflow.compliance_status?.toLowerCase()}`}>
                  {workflow.compliance_status}
                </div>
              </div>
              <div className="audit-field">
                <span className="field-name">Brand Tone Analysis</span>
                <p className="field-value">{workflow.compliance_brand_tone_check}</p>
              </div>
              <div className="audit-field">
                <span className="field-name">Audit Details</span>
                <p className="field-value">{workflow.compliance_details}</p>
              </div>
            </div>
          </div>

          {/* PUBLISHING SECTION (ONLY ENABLED IF APPROVED) */}
          <div className="publishing-section-card">
            <div className="pub-header">
              <div className="header-with-badge">
                <Share2 size={20} className="text-indigo" />
                <h3>Publishing Agent Channel Dispatch</h3>
              </div>
              {workflow.approval_status !== "APPROVED" ? (
                <span className="blocked-pill">
                  Publishing Blocked — Requires Manager Approval First
                </span>
              ) : (
                <span className="ready-pill">Authorized for Publishing</span>
              )}
            </div>

            <p className="pub-desc">
              Select channels to syndicate approved marketing copy. Official API connections are verified before execution.
            </p>

            <div className="channels-selection-grid">
              <label
                className={`channel-checkbox-card ${
                  selectedChannels.includes("website") ? "selected" : ""
                }`}
                onClick={() => toggleChannel("website")}
              >
                <input
                  type="checkbox"
                  checked={selectedChannels.includes("website")}
                  onChange={() => {}}
                />
                <div>
                  <strong>Company Website CMS</strong>
                  <span>Official CMS API (Live)</span>
                </div>
              </label>

              <label
                className={`channel-checkbox-card ${
                  selectedChannels.includes("linkedin") ? "selected" : ""
                }`}
                onClick={() => toggleChannel("linkedin")}
              >
                <input
                  type="checkbox"
                  checked={selectedChannels.includes("linkedin")}
                  onChange={() => {}}
                />
                <div>
                  <strong>LinkedIn Page</strong>
                  <span>Account Not Connected (Requires OAuth)</span>
                </div>
              </label>

              <label
                className={`channel-checkbox-card ${
                  selectedChannels.includes("instagram") ? "selected" : ""
                }`}
                onClick={() => toggleChannel("instagram")}
              >
                <input
                  type="checkbox"
                  checked={selectedChannels.includes("instagram")}
                  onChange={() => {}}
                />
                <div>
                  <strong>Instagram Professional</strong>
                  <span>Account Not Connected (Meta Graph API)</span>
                </div>
              </label>
            </div>

            <div className="pub-actions">
              <button
                className="agent-btn primary"
                disabled={actionLoading || workflow.approval_status !== "APPROVED"}
                onClick={handlePublish}
              >
                <Share2 size={16} />
                <span>
                  {workflow.approval_status !== "APPROVED"
                    ? "Approve Content Above to Enable Publishing"
                    : "Publish Approved Content Now"}
                </span>
              </button>
            </div>

            {/* PUBLISHING RESULTS DISPLAY */}
            {publishResults && publishResults.length > 0 && (
              <div className="publish-results-box">
                <h4>Publishing Platform Responses</h4>
                {publishResults.map((res, i) => (
                  <div key={i} className={`pub-res-row ${res.status.toLowerCase()}`}>
                    <strong>{res.channel}</strong>
                    <span>{res.response}</span>
                    {res.published_url && (
                      <a href={res.published_url} target="_blank" rel="noreferrer">
                        View Live <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default HumanApprovalDashboard;
