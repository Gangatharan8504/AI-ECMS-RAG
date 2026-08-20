import {
  Upload,
  FileText,
  CheckCircle2,
  Clock3,
  MoreVertical,
  Search,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import "./Documents.css";
import { useRef, useState } from "react";
import { useDocuments } from "../context/DocumentContext";
import { uploadDocument } from "../services/api";

function Documents() {
  const fileInputRef = useRef(null);
  const {
    documents,
    setDocuments,
    handleDocumentUploaded,
    setActiveDocument,
    activeDocument,
  } = useDocuments();

  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a PDF file.");
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setProcessingStage("Uploading document...");

    const stageTimer1 = setTimeout(() => {
      setProcessingStage("Extracting content & running OCR...");
    }, 1500);

    const stageTimer2 = setTimeout(() => {
      setProcessingStage("Building FAISS knowledge index & generating embeddings...");
    }, 4500);

    const stageTimer3 = setTimeout(() => {
      setProcessingStage("Generating AI summary, topics & risk analysis...");
    }, 8000);

    try {
      const response = await uploadDocument(selectedFile);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      if (response && response.success && response.document) {
        handleDocumentUploaded(response);
        setProcessingStage("Completed!");
        setTimeout(() => {
          setSelectedFile(null);
          setIsProcessing(false);
          setProcessingStage("");
        }, 1000);
      } else {
        throw new Error(response.message || "Failed to process document.");
      }
    } catch (error) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      console.error("Upload error:", error);

      let detail = "Unable to connect to AI ECMS backend. Please make sure the FastAPI server is running.";
      if (error.response?.data?.detail) {
        detail = error.response.data.detail;
      } else if (error.message) {
        detail = error.message;
      }
      setErrorMessage(detail);
      setIsProcessing(false);
      setProcessingStage("");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeSelectedFile = () => {
    if (isProcessing) return;
    setSelectedFile(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="documents-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <p className="welcome-small">DOCUMENT MANAGEMENT</p>
          <h1>Documents</h1>
          <p className="header-description">
            Upload, process and manage your college documents with AI.
          </p>
        </div>

        <button
          className="upload-button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={17} />
          Upload PDF
        </button>
      </div>

      {/* UPLOAD AREA */}
      <div className="upload-card">
        <div
          className={`upload-dropzone ${isProcessing ? "disabled" : ""}`}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <div className="upload-icon">
            <Upload size={28} />
          </div>

          <h2>Upload a college document</h2>
          <p>Choose a PDF document to analyze with AI</p>
          <span>PDF files only</span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            hidden
            disabled={isProcessing}
          />
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              marginTop: "12px",
              borderRadius: "10px",
              background: "rgba(225, 29, 72, 0.08)",
              border: "1px solid #fecdd3",
              color: "#be123c",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SELECTED FILE */}
        {selectedFile && (
          <div className="selected-file">
            <div className="selected-file-left">
              <div className="file-icon">
                <FileText size={20} />
              </div>

              <div>
                <strong>{selectedFile.name}</strong>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>

            {!isProcessing && (
              <button className="remove-file" onClick={removeSelectedFile}>
                <X size={17} />
              </button>
            )}
          </div>
        )}

        {/* PROCESSING STAGE STATUS */}
        {isProcessing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              marginTop: "12px",
              borderRadius: "10px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#e11d48",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Loader2 size={18} className="spin-icon" style={{ animation: "spin 1s linear infinite" }} />
            <span>{processingStage}</span>
          </div>
        )}

        {selectedFile && !isProcessing && (
          <button className="process-button" onClick={handleUpload}>
            <Upload size={17} />
            Process Document
          </button>
        )}
      </div>

      {/* DOCUMENT LIST */}
      <div className="documents-section">
        <div className="section-header">
          <div>
            <h2>Recent Documents</h2>
            <p>{documents.length} documents in your workspace</p>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {/* DOCUMENT TABLE */}
        <div className="document-table">
          <div className="table-header">
            <span>DOCUMENT</span>
            <span>CATEGORY</span>
            <span>PAGES</span>
            <span>LANGUAGE</span>
            <span>STATUS</span>
            <span></span>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="empty-state">
              <FileText size={35} />
              <h3>No documents found</h3>
              <p>
                {searchTerm
                  ? "Try a different search term."
                  : "Upload your first college document above to get started."}
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <div
                className={`document-table-row ${
                  activeDocument?.id === document.id ? "active-row" : ""
                }`}
                key={document.id}
                onClick={() => setActiveDocument(document)}
                style={{ cursor: "pointer" }}
              >
                <div className="document-name">
                  <div className="table-file-icon">
                    <FileText size={18} />
                  </div>

                  <div>
                    <strong>{document.name}</strong>
                    <span>PDF Document</span>
                  </div>
                </div>

                <span className="category">{document.category || "Academic"}</span>
                <span className="table-text">{document.pages}</span>
                <span className="table-text">{document.language || "English"}</span>

                <span>
                  {document.status === "Processed" ? (
                    <span className="status processed">
                      <CheckCircle2 size={14} />
                      Processed
                    </span>
                  ) : (
                    <span className="status processing">
                      <Clock3 size={14} />
                      Processing
                    </span>
                  )}
                </span>

                <div className="document-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    title="Select / View"
                    onClick={() => setActiveDocument(document)}
                    style={{
                      color: activeDocument?.id === document.id ? "#e11d48" : "inherit",
                    }}
                  >
                    <Eye size={16} />
                  </button>
                  <button title="More">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Documents;