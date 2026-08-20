import {
  FileText,
  MessageSquare,
  Languages,
  Brain,
  Upload,
  ArrowUpRight,
  Sparkles,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { useDocuments } from "../context/DocumentContext";

function Dashboard() {
  const navigate = useNavigate();
  const {
    documents,
    totalPages,
    queryCount,
    uniqueLanguages,
    activities,
    isBackendOnline,
    setActiveDocument,
  } = useDocuments();

  return (
    <div className="dashboard-page">
      {/* =========================
          HEADER
      ========================= */}
      <div className="dashboard-header">
        <div>
          <p className="welcome-small">COLLEGE CONTENT INTELLIGENCE</p>
          <h1>Good morning, Charan 👋</h1>
          <p className="header-description">
            Manage, analyze and understand your college content with AI.
          </p>
        </div>

        <button
          className="upload-button"
          onClick={() => navigate("/documents")}
        >
          <Upload size={17} />
          Upload Document
        </button>
      </div>

      {/* =========================
          AI BANNER
      ========================= */}
      <div className="ai-banner">
        <div className="ai-banner-icon">
          <Sparkles size={21} />
        </div>

        <div className="ai-banner-content">
          <strong>AI Content Intelligence is ready</strong>
          <span>
            Upload a college document to extract, analyze, summarize and chat with its content.
          </span>
        </div>

        <div className="ai-ready">
          <span
            style={{
              background: isBackendOnline ? "#22c55e" : "#e11d48",
            }}
          ></span>
          {isBackendOnline ? "All systems operational" : "Connecting to backend..."}
        </div>
      </div>

      {/* =========================
          REAL USER STATISTICS
      ========================= */}
      <div className="dashboard-stats">
        <StatCard
          icon={<FileText size={20} />}
          label="Total Documents"
          value={documents.length}
          type="purple"
        />

        <StatCard
          icon={<FileText size={20} />}
          label="Pages Processed"
          value={totalPages}
          type="rose"
        />

        <StatCard
          icon={<MessageSquare size={20} />}
          label="AI Queries"
          value={queryCount}
          type="green"
        />

        <StatCard
          icon={<Languages size={20} />}
          label="Languages"
          value={uniqueLanguages.length}
          type="orange"
        />
      </div>

      {/* =========================
          MAIN GRID
      ========================= */}
      <div className="dashboard-main-grid">
        {/* RECENT DOCUMENTS */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Recent Documents</h2>
              <p>Your recently processed college documents</p>
            </div>

            <button
              className="text-button"
              onClick={() => navigate("/documents")}
            >
              View all
              <ArrowUpRight size={15} />
            </button>
          </div>

          {documents.length === 0 ? (
            <EmptyDocuments onUpload={() => navigate("/documents")} />
          ) : (
            documents.slice(0, 5).map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                onClick={() => {
                  setActiveDocument(document);
                  navigate("/assistant");
                }}
              />
            ))
          )}
        </section>

        {/* QUICK ACTIONS */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Start working with your documents</p>
            </div>
          </div>

          <div className="dashboard-actions">
            <ActionCard
              icon={<Upload size={20} />}
              title="Upload Document"
              description="Add a new PDF"
              onClick={() => navigate("/documents")}
            />

            <ActionCard
              icon={<MessageSquare size={20} />}
              title="Ask AI"
              description="Chat with documents"
              onClick={() => navigate("/assistant")}
            />

            <ActionCard
              icon={<Brain size={20} />}
              title="AI Insights"
              description="Summary & risk analysis"
              onClick={() => navigate("/insights")}
            />

            <ActionCard
              icon={<Languages size={20} />}
              title="Translate"
              description="Translate content"
              onClick={() => navigate("/translation")}
            />
          </div>
        </section>
      </div>

      {/* =========================
          BOTTOM GRID
      ========================= */}
      <div className="dashboard-bottom-grid">
        {/* RECENT ACTIVITY */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest AI operations</p>
            </div>
          </div>

          {activities.length === 0 ? (
            <EmptyActivity />
          ) : (
            activities.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))
          )}
        </section>

        {/* SYSTEM STATUS */}
        <section className="dashboard-panel system-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>AI System Status</h2>
              <p>Intelligence services</p>
            </div>
          </div>

          <SystemStatus
            name="Groq LLM"
            status={isBackendOnline ? "Ready" : "Connecting"}
            online={isBackendOnline}
          />

          <SystemStatus
            name="FAISS Search"
            status={isBackendOnline ? "Ready" : "Connecting"}
            online={isBackendOnline}
          />

          <SystemStatus
            name="Embeddings"
            status={isBackendOnline ? "Ready" : "Connecting"}
            online={isBackendOnline}
          />

          <SystemStatus
            name="FastAPI Backend"
            status={isBackendOnline ? "Online" : "Offline"}
            online={isBackendOnline}
            warning={!isBackendOnline}
          />
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */
function StatCard({ icon, label, value, type }) {
  return (
    <div className="dashboard-stat-card">
      <div className={`dashboard-stat-icon ${type}`}>{icon}</div>

      <div className="dashboard-stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY DOCUMENTS
========================================================= */
function EmptyDocuments({ onUpload }) {
  return (
    <div className="dashboard-empty">
      <div className="empty-icon">
        <FileText size={24} />
      </div>

      <h3>No documents yet</h3>
      <p>
        Upload your first college document to get started with AI-powered document intelligence.
      </p>

      <button className="empty-upload-button" onClick={onUpload}>
        <Upload size={15} />
        Upload Document
      </button>
    </div>
  );
}

/* =========================================================
   EMPTY ACTIVITY
========================================================= */
function EmptyActivity() {
  return (
    <div className="dashboard-empty activity-empty">
      <div className="empty-icon">
        <Clock3 size={22} />
      </div>

      <h3>No activity yet</h3>
      <p>Your document processing and AI activity will appear here.</p>
    </div>
  );
}

/* =========================================================
   DOCUMENT ROW
========================================================= */
function DocumentRow({ document, onClick }) {
  return (
    <div
      className="dashboard-document-row"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="dashboard-document-icon">📄</div>

      <div className="dashboard-document-info">
        <strong>{document.name}</strong>
        <span>
          {document.category || "Academic"} • {document.pages} pages • {document.language || "English"}
        </span>
      </div>

      <div className="status processed">✓ Processed</div>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */
function ActionCard({ icon, title, description, onClick }) {
  return (
    <button className="dashboard-action-card" onClick={onClick}>
      <div className="dashboard-action-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <ArrowUpRight size={15} />
    </button>
  );
}

/* =========================================================
   ACTIVITY
========================================================= */
function ActivityRow({ activity }) {
  return (
    <div className="dashboard-activity-row">
      <div className="activity-icon success">✓</div>

      <div className="activity-content">
        <strong>{activity.title}</strong>
        <span>{activity.description}</span>
      </div>

      <small>{activity.time}</small>
    </div>
  );
}

/* =========================================================
   SYSTEM STATUS
========================================================= */
function SystemStatus({ name, status, online = true, warning = false }) {
  return (
    <div className="system-status-row">
      <span>{name}</span>

      <strong className={warning ? "system-warning" : online ? "system-online" : "system-warning"}>
        <i></i>
        {status}
      </strong>
    </div>
  );
}

export default Dashboard;