import React, { useState } from "react";
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
} from "lucide-react";

import "./ContentReview.css";
import { useDocuments } from "../context/DocumentContext";

const ContentReview = () => {
  const navigate = useNavigate();
  const { documents, isBackendOnline, setActiveDocument } = useDocuments();

  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReviewDoc, setSelectedReviewDoc] = useState(null);

  const filters = [
    "All",
    "Pending Review",
    "AI Reviewed",
    "Approved",
    "Changes Requested",
  ];

  // Derive review status from actual backend risk analysis
  const reviewDocuments = documents.map((doc) => {
    let reviewStatus = "AI Reviewed";
    if (doc.risks && !doc.risks.toLowerCase().includes("no significant content-quality risks")) {
      reviewStatus = "Changes Requested";
    } else {
      reviewStatus = "Approved";
    }

    return {
      ...doc,
      reviewStatus,
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

  const workflowSteps = [
    {
      number: "01",
      icon: BrainCircuit,
      title: "AI Analysis",
      description:
        "AI analyzes document content, rules, risks and important information.",
    },
    {
      number: "02",
      icon: ClipboardCheck,
      title: "Content Review",
      description:
        "Faculty or authorized staff review the AI findings and document content.",
    },
    {
      number: "03",
      icon: UserCheck,
      title: "Human Approval",
      description:
        "Approved content can move forward after human verification.",
    },
  ];

  const reviewTypes = [
    {
      icon: ShieldCheck,
      title: "Policy Compliance",
      description:
        "Check academic and institutional content for important policy concerns.",
    },
    {
      icon: AlertTriangle,
      title: "Risk Detection",
      description:
        "Identify potentially important clauses, missing information or risks.",
    },
    {
      icon: FileText,
      title: "Content Quality",
      description:
        "Review document structure, clarity and extracted content.",
    },
    {
      icon: MessageSquare,
      title: "Reviewer Feedback",
      description:
        "Allow authorized reviewers to add comments and request changes.",
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 size={15} />;
      case "Pending Review":
        return <Clock3 size={15} />;
      case "AI Reviewed":
        return <ShieldCheck size={15} />;
      case "Changes Requested":
        return <XCircle size={15} />;
      default:
        return <CircleDot size={15} />;
    }
  };

  return (
    <div className="review-page">
      {/* =====================================
          HEADER
      ====================================== */}
      <header className="review-header">
        <div className="review-heading">
          <div className="review-title-icon">
            <ShieldCheck size={22} />
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

        <div className="review-header-status">
          <span
            className="review-status-dot"
            style={{ background: isBackendOnline ? "#22c55e" : "#e11d48" }}
          ></span>
          Review Workflow Ready
        </div>
      </header>

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

            <button className="secondary-review-button">
              <ClipboardCheck size={15} />
              Review Workflow
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

        {/* REVIEW DETAILS MODAL / CARD */}
        {selectedReviewDoc && (
          <div
            style={{
              padding: "16px",
              marginBottom: "16px",
              borderRadius: "12px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <strong style={{ color: "#be123c", fontSize: "14px" }}>
                AI Risk & Quality Assessment: {selectedReviewDoc.name}
              </strong>
              <button
                onClick={() => setSelectedReviewDoc(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#be123c",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: "1.6",
                color: "#4c0519",
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedReviewDoc.risks || "No significant content-quality risks detected."}
            </p>
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
              Documents submitted for AI analysis will appear here when they require human review.
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
                    {document.category || "Academic"} • {document.pages} pages • {document.language}
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
                  }}
                >
                  <Eye size={14} />
                  Review
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

        <div className="review-info-status">
          <CircleDot size={12} />
          {isBackendOnline ? "Connected to Backend" : "Connecting..."}
        </div>
      </section>
    </div>
  );
};

export default ContentReview;