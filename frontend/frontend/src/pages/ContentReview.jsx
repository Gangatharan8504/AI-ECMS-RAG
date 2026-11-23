import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Sparkles,
  FileText,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  Upload,
  ArrowRight,
  BrainCircuit,
  UserCheck,
  ClipboardCheck,
  CircleDot,
  RefreshCw,
  X,
  Check,
  Send,
  Download,
} from "lucide-react";

import "./ContentReview.css";
import { useDocuments } from "../context/DocumentContext";
import { useAuth } from "../context/AuthContext";

const ContentReview = () => {
  const navigate = useNavigate();
  const { documents, isBackendOnline, setActiveDocument, refreshDocuments } = useDocuments();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReviewDoc, setSelectedReviewDoc] = useState(null);

  // Review decisions state persisted in localStorage
  const [reviewDecisions, setReviewDecisions] = useState(() => {
    try {
      const saved = localStorage.getItem("ai_ecms_review_decisions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reviewer comment input
  const [reviewerComment, setReviewerComment] = useState("");
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  const saveDecision = (docId, status, comment = "") => {
    const updated = {
      ...reviewDecisions,
      [docId]: {
        status,
        reviewer: user?.name || "Faculty Reviewer",
        comment,
        timestamp: new Date().toLocaleString(),
      },
    };
    setReviewDecisions(updated);
    localStorage.setItem("ai_ecms_review_decisions", JSON.stringify(updated));
    setReviewSuccessMsg(`Document marked as "${status}" by ${user?.name || "Reviewer"}`);
    setTimeout(() => setReviewSuccessMsg(""), 3500);
  };

  const filters = [
    "All",
    "Pending Review",
    "Approved",
    "Changes Requested",
    "Rejected",
  ];

  // Derive review status for each document
  const reviewDocuments = documents.map((doc) => {
    const saved = reviewDecisions[doc.id];
    let reviewStatus = "Pending Review";

    if (saved && saved.status) {
      reviewStatus = saved.status;
    } else if (doc.risks && !doc.risks.toLowerCase().includes("no significant content-quality risks")) {
      reviewStatus = "Changes Requested";
    }

    return {
      ...doc,
      reviewStatus,
      reviewerInfo: saved || null,
    };
  });

  const filteredReviewDocuments = reviewDocuments.filter((doc) => {
    const matchesFilter =
      activeFilter === "All" || doc.reviewStatus === activeFilter;
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 size={13} />;
      case "Changes Requested":
        return <AlertTriangle size={13} />;
      case "Rejected":
        return <XCircle size={13} />;
      default:
        return <Clock3 size={13} />;
    }
  };

  const workflowSteps = [
    {
      number: "01",
      icon: BrainCircuit,
      title: "AI Analysis",
      description: "AI extracts text, detects risks, topics and institutional compliance.",
    },
    {
      number: "02",
      icon: ClipboardCheck,
      title: "Content Review",
      description: "Authorized staff or faculty audit findings and add governance notes.",
    },
    {
      number: "03",
      icon: UserCheck,
      title: "Human Approval",
      description: "Approved college resources are verified and certified for institutional use.",
    },
  ];

  const reviewTypes = [
    {
      icon: ShieldCheck,
      title: "Policy Compliance",
      description: "Check academic and institutional content for important policy concerns.",
    },
    {
      icon: AlertTriangle,
      title: "Risk Detection",
      description: "Identify potentially important clauses, missing information or risks.",
    },
    {
      icon: FileText,
      title: "Content Quality",
      description: "Review document structure, clarity and extracted content.",
    },
    {
      icon: MessageSquare,
      title: "Reviewer Feedback",
      description: "Allow authorized reviewers to add comments and request changes.",
    },
  ];

  return (
    <div className="review-page">
      {/* =====================================
          HEADER
      ====================================== */}
      <header className="review-header">
        <div className="review-heading">
          <div className="review-title-icon">
            <ClipboardCheck size={22} />
          </div>

          <div>
            <div className="review-title-row">
              <h1>Content Review</h1>
              <span className="review-ai-badge">
                <Sparkles size={11} />
                AI Assisted
              </span>
            </div>

            <p>
              Review, validate and approve AI-analyzed college documents before publishing.
            </p>
          </div>
        </div>

        <div className="review-status">
          <span className="review-status-dot"></span>
          <span>Review Workflow Ready</span>
        </div>
      </header>

      {/* SUCCESS NOTIFICATION */}
      {reviewSuccessMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#dcfce7",
            border: "1px solid #86efac",
            color: "#166534",
            padding: "12px 18px",
            borderRadius: "10px",
            marginBottom: "18px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{reviewSuccessMsg}</span>
        </div>
      )}

      {/* =====================================
          HERO
      ====================================== */}
      <section className="review-hero">
        <div className="review-hero-content">
          <div className="review-hero-badge">
            <ShieldCheck size={13} />
            HUMAN-IN-THE-LOOP REVIEW
          </div>

          <h2>
            Keep AI intelligent.
            <span> Keep humans in control.</span>
          </h2>

          <p>
            AI ECMS analyzes college documents and highlights important findings.
            Authorized reviewers can verify the content before it becomes an approved college resource.
          </p>

          <div className="review-hero-actions">
            <button
              className="primary-review-button"
              onClick={() => navigate("/documents")}
            >
              <Upload size={15} />
              Submit Document
              <ArrowRight size={14} />
            </button>

            <button
              className="secondary-review-button"
              onClick={() => {
                refreshDocuments();
              }}
            >
              <RefreshCw size={15} />
              Refresh Queue
            </button>
          </div>
        </div>

        {/* Workflow visual */}
        <div className="review-hero-visual">
          <div className="review-flow-line"></div>

          <div className="review-flow-node node-one">
            <BrainCircuit size={19} />
            <span>AI</span>
          </div>

          <div className="review-flow-node node-two">
            <Eye size={19} />
            <span>Review</span>
          </div>

          <div className="review-flow-node node-three">
            <CheckCircle2 size={19} />
            <span>Approve</span>
          </div>
        </div>
      </section>

      {/* =====================================
          WORKFLOW STATUS
      ====================================== */}
      <section className="review-workflow-card">
        <div className="workflow-header">
          <div>
            <span className="review-eyebrow">APPROVAL WORKFLOW</span>
            <h3>AI → Review → Approval</h3>
          </div>

          <div className="workflow-secure-badge">
            <ShieldCheck size={12} />
            Human Verification
          </div>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <React.Fragment key={step.number}>
                <div className="workflow-step">
                  <div className="workflow-step-top">
                    <span className="workflow-number">{step.number}</span>
                    <div className="workflow-icon">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>

                {index < workflowSteps.length - 1 && (
                  <div className="workflow-arrow">
                    <ArrowRight size={16} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* =====================================
          REVIEW QUEUE
      ====================================== */}
      <section className="review-queue-section">
        <div className="queue-heading">
          <div>
            <span className="review-eyebrow">REVIEW QUEUE</span>
            <h3>Documents awaiting review ({filteredReviewDocuments.length})</h3>
          </div>

          <div className="queue-tools">
            <div className="review-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-wrapper">
              <button
                className="filter-button"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter size={14} />
                {activeFilter}
                <ChevronDown size={13} />
              </button>

              {showFilter && (
                <div className="filter-dropdown">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setShowFilter(false);
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INTERACTIVE REVIEW INSPECTION MODAL / DRAWER */}
        {selectedReviewDoc && (
          <div
            style={{
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "12px",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: "16px",
              }}
            >
              <div>
                <strong style={{ color: "#0f172a", fontSize: "16px" }}>
                  Auditing Document: {selectedReviewDoc.name}
                </strong>
                <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                  {selectedReviewDoc.pages} Pages • Language: {selectedReviewDoc.language || "English"}
                </span>
              </div>
              <button
                onClick={() => setSelectedReviewDoc(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* AI FINDINGS GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#4f46e5", textTransform: "uppercase" }}>
                  Executive AI Summary
                </span>
                <p style={{ fontSize: "12px", color: "#334155", margin: "6px 0 0", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {selectedReviewDoc.summary || "Summary generation pending."}
                </p>
              </div>

              <div
                style={{
                  background: "#fff1f2",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #fecdd3",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#be123c", textTransform: "uppercase" }}>
                  Risk & Policy Compliance Checks
                </span>
                <p style={{ fontSize: "12px", color: "#881337", margin: "6px 0 0", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {selectedReviewDoc.risks || "No significant content-quality risks detected."}
                </p>
              </div>
            </div>

            {/* REVIEWER DECISION ACTIONS */}
            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Reviewer Governance Comment / Modification Request:
              </label>
              <input
                type="text"
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                placeholder="e.g. Verified for university syllabus standards; approved."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "12px",
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Active Reviewer: <strong>{user?.name || "Alex (Faculty)"}</strong>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => saveDecision(selectedReviewDoc.id, "Rejected", reviewerComment)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <X size={14} /> Reject
                  </button>

                  <button
                    onClick={() => saveDecision(selectedReviewDoc.id, "Changes Requested", reviewerComment)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#f59e0b",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <AlertTriangle size={14} /> Request Changes
                  </button>

                  <button
                    onClick={() => saveDecision(selectedReviewDoc.id, "Approved", reviewerComment)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#10b981",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Check size={14} /> Approve Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty queue */}
        {filteredReviewDocuments.length === 0 ? (
          <div className="empty-review-queue">
            <div className="empty-review-icon">
              <ClipboardCheck size={26} />
            </div>

            <h4>No documents in the review queue</h4>
            <p>
              Upload documents in the Documents section to start the review & approval workflow.
            </p>

            <button
              className="empty-submit-button"
              onClick={() => navigate("/documents")}
            >
              <Upload size={14} />
              Submit a Document
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="review-document-list">
            {filteredReviewDocuments.map((document) => (
              <div className="review-document-row" key={document.id}>
                <div className="document-row-icon">
                  <FileText size={18} />
                </div>

                <div className="document-row-info">
                  <strong>{document.name}</strong>
                  <span>
                    {document.category || "Academic"} • {document.pages} pages • {document.language || "English"}
                    {document.reviewerInfo && ` • Reviewed by ${document.reviewerInfo.reviewer}`}
                  </span>
                </div>

                <div
                  className={`review-status ${document.reviewStatus
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {getStatusIcon(document.reviewStatus)}
                  {document.reviewStatus}
                </div>

                <button
                  className="view-review-button"
                  onClick={() => {
                    setActiveDocument(document);
                    setSelectedReviewDoc(document);
                    setReviewerComment(document.reviewerInfo?.comment || "");
                  }}
                >
                  <Eye size={14} />
                  Review & Decide
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================
          REVIEW CAPABILITIES
      ====================================== */}
      <section className="review-capabilities">
        <div className="capabilities-heading">
          <div>
            <span className="review-eyebrow">REVIEW INTELLIGENCE</span>
            <h3>What reviewers can verify</h3>
          </div>

          <span className="capabilities-note">Powered by document-grounded AI</span>
        </div>

        <div className="review-capability-grid">
          {reviewTypes.map((item, index) => {
            const Icon = item.icon;

            return (
              <div className="review-capability-card" key={index}>
                <div className="capability-icon">
                  <Icon size={18} />
                </div>

                <h4>{item.title}</h4>
                <p>{item.description}</p>

                <ArrowRight size={14} className="capability-arrow" />
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================
          FOOTER INFO
      ====================================== */}
      <section className="review-info-bar">
        <div className="review-info-icon">
          <RefreshCw size={17} />
        </div>

        <div>
          <strong>Version-aware content review</strong>
          <p>
            Tracks document content quality, AI risk identification and human reviewer approval history.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ContentReview;
