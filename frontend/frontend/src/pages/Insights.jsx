import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  FileText,
  ShieldAlert,
  Languages,
  BrainCircuit,
  CircleCheck,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Search,
  Upload,
} from "lucide-react";

import "./Insights.css";
import { useDocuments } from "../context/DocumentContext";

const Insights = () => {
  const navigate = useNavigate();
  const {
    documents,
    activeDocument,
    uniqueLanguages,
    isBackendOnline,
  } = useDocuments();

  // Calculate real metrics from processed documents
  const totalDocs = documents.length;
  const totalTopicsCount = documents.reduce((sum, doc) => {
    if (!doc.key_topics) return sum;
    // Count numbered topics e.g. "1. ", "2. "
    const matches = doc.key_topics.match(/\d+\.\s/g);
    return sum + (matches ? matches.length : 1);
  }, 0);

  const totalRisksCount = documents.filter((doc) => {
    if (!doc.risks) return false;
    return !doc.risks.toLowerCase().includes("no significant content-quality risks");
  }).length;

  const stats = [
    {
      label: "Documents Analyzed",
      value: totalDocs,
      icon: FileText,
      description: "AI processed documents",
    },
    {
      label: "Key Topics",
      value: totalTopicsCount,
      icon: BrainCircuit,
      description: "Topics identified",
    },
    {
      label: "Risk Findings",
      value: totalRisksCount,
      icon: ShieldAlert,
      description: "Potential issues detected",
    },
    {
      label: "Languages",
      value: uniqueLanguages.length,
      icon: Languages,
      description: "Languages detected",
    },
  ];

  const analysisFeatures = [
    {
      icon: BrainCircuit,
      title: "Key Topics",
      description:
        "AI identifies important subjects, themes and concepts from your college documents.",
    },
    {
      icon: ShieldAlert,
      title: "Risk Analysis",
      description:
        "Detect potentially important rules, missing information and compliance-related concerns.",
    },
    {
      icon: FileText,
      title: "Document Summary",
      description:
        "Generate concise summaries grounded in the actual uploaded document content.",
    },
    {
      icon: Languages,
      title: "Language Intelligence",
      description:
        "Detect document language automatically and prepare content for translation.",
    },
  ];

  return (
    <div className="insights-page">
      {/* =====================================
          HEADER
      ====================================== */}
      <header className="insights-header">
        <div className="insights-heading">
          <div className="insights-title-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <div className="insights-title-row">
              <h1>AI Insights</h1>
              <span className="insights-ai-badge">
                <span className="insights-status-dot"></span>
                AI Intelligence
              </span>
            </div>

            <p>
              Understand your college documents through AI-powered analysis and content intelligence.
            </p>
          </div>
        </div>

        <div className="insights-header-status">
          <CircleCheck size={15} />
          <span>{isBackendOnline ? "Analysis Engine Ready" : "Connecting to Engine..."}</span>
        </div>
      </header>

      {/* =====================================
          HERO
      ====================================== */}
      <section className="insights-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={13} />
            COLLEGE CONTENT INTELLIGENCE
          </div>

          <h2>
            Turn college documents into
            <span> meaningful insights.</span>
          </h2>

          <p>
            AI ECMS analyzes your uploaded academic, examination, placement and policy documents
            to extract executive summaries, key topics, and content-quality risks automatically.
          </p>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-one"></div>
          <div className="hero-orbit orbit-two"></div>

          <div className="hero-ai-core">
            <Sparkles size={30} />
          </div>

          <div className="floating-insight insight-one">
            <BrainCircuit size={15} />
            <span>Topics</span>
          </div>

          <div className="floating-insight insight-two">
            <ShieldAlert size={15} />
            <span>Risks</span>
          </div>

          <div className="floating-insight insight-three">
            <FileText size={15} />
            <span>Summary</span>
          </div>
        </div>
      </section>

      {/* =====================================
          STATISTICS
      ====================================== */}
      <section className="insight-stat-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div className="insight-stat-card" key={index}>
              <div className="stat-card-top">
                <div className="insight-stat-icon">
                  <Icon size={18} />
                </div>
                <span className="stat-live-dot"></span>
              </div>

              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-description">{stat.description}</div>
            </div>
          );
        })}
      </section>

      {/* =====================================
          MAIN INSIGHTS GRID
      ====================================== */}
      <section className="insights-main-grid">
        {/* Document Intelligence */}
        <div className="insight-panel document-intelligence-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">EXECUTIVE SUMMARY</span>
              <h3>
                {activeDocument ? `Summary: ${activeDocument.name}` : "Document Health"}
              </h3>
            </div>

            <div className="panel-header-icon">
              <BarChart3 size={18} />
            </div>
          </div>

          {!activeDocument || !activeDocument.summary ? (
            <div className="empty-analysis">
              <div className="empty-analysis-icon">
                <FileText size={25} />
              </div>
              <h4>No documents analyzed yet</h4>
              <p>
                Upload a college document to generate AI-powered insights, summaries and risk analysis.
              </p>

              <button
                className="upload-insight-button"
                onClick={() => navigate("/documents")}
              >
                <Upload size={15} />
                Upload Document
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "16px", maxHeight: "260px", overflowY: "auto" }}>
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                  color: "var(--text-primary, #27272a)",
                }}
              >
                {activeDocument.summary}
              </div>
            </div>
          )}
        </div>

        {/* AI Findings / Key Topics */}
        <div className="insight-panel findings-panel">
          <div className="panel-header">
            <div>
              <span className="panel-eyebrow">AI FINDINGS</span>
              <h3>Key Topics Identified</h3>
            </div>

            <Lightbulb size={19} className="panel-accent-icon" />
          </div>

          {!activeDocument || !activeDocument.key_topics ? (
            <div className="no-findings">
              <div className="no-findings-icon">
                <Search size={21} />
              </div>
              <strong>Waiting for document analysis</strong>
              <p>AI findings will appear here after your documents are processed.</p>
            </div>
          ) : (
            <div style={{ marginTop: "16px", maxHeight: "260px", overflowY: "auto" }}>
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                  color: "var(--text-primary, #27272a)",
                }}
              >
                {activeDocument.key_topics}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================
          AI ANALYSIS CAPABILITIES
      ====================================== */}
      <section className="analysis-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">AI CAPABILITIES</span>
            <h3>What AI ECMS can analyze</h3>
          </div>

          <span className="section-note">Powered by your document content</span>
        </div>

        <div className="analysis-feature-grid">
          {analysisFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div className="analysis-feature-card" key={index}>
                <div className="feature-icon">
                  <Icon size={19} />
                </div>

                <div className="feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>

                <ArrowRight size={15} className="feature-arrow" />
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================
          RISK / LANGUAGE / SUMMARY
      ====================================== */}
      <section className="secondary-insights-grid">
        <div className="mini-insight-card">
          <div className="mini-card-header">
            <div className="mini-icon warning">
              <AlertTriangle size={17} />
            </div>

            <div>
              <span>RISK ANALYSIS</span>
              <h4>Document Risks & Quality</h4>
            </div>
          </div>

          {!activeDocument || !activeDocument.risks ? (
            <div className="mini-empty">
              <strong>No risk findings</strong>
              <p>Upload and analyze documents to identify potential policy or content risks.</p>
            </div>
          ) : (
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  color: "var(--text-primary, #27272a)",
                }}
              >
                {activeDocument.risks}
              </p>
            </div>
          )}
        </div>

        <div className="mini-insight-card">
          <div className="mini-card-header">
            <div className="mini-icon language">
              <Languages size={17} />
            </div>

            <div>
              <span>LANGUAGE INTELLIGENCE</span>
              <h4>Detected Languages</h4>
            </div>
          </div>

          {uniqueLanguages.length === 0 ? (
            <div className="language-empty">
              <div className="language-count">0</div>
              <div>
                <strong>No languages detected</strong>
                <p>Language detection begins when a document is processed.</p>
              </div>
            </div>
          ) : (
            <div className="language-empty">
              <div className="language-count" style={{ color: "#e11d48" }}>
                {uniqueLanguages.length}
              </div>
              <div>
                <strong>{uniqueLanguages.join(", ")}</strong>
                <p>Detected across your processed college repository.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Insights;