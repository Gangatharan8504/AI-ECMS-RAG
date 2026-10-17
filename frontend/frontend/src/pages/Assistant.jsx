import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  FileText,
  BrainCircuit,
  Search,
  BookOpen,
  ShieldCheck,
  Plus,
  User,
  Copy,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

import "./Assistant.css";
import { useDocuments } from "../context/DocumentContext";
import { askDocument } from "../services/api";

const Assistant = () => {
  const {
    documents,
    activeDocument,
    setActiveDocument,
    handleQueryAsked,
    isBackendOnline,
  } = useDocuments();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState("Searching document...");
  const [showDocuments, setShowDocuments] = useState(false);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    {
      icon: FileText,
      title: "Summarize this document",
      description: "Get the key points from my document",
      prompt: "Summarize the key points of this document.",
    },
    {
      icon: Search,
      title: "Find important rules",
      description: "Find important rules and regulations",
      prompt:
        "What are the most important rules and regulations mentioned in the document?",
    },
    {
      icon: BookOpen,
      title: "Explain academic policy",
      description: "Understand academic regulations",
      prompt:
        "Explain the important academic policies in simple terms.",
    },
    {
      icon: BrainCircuit,
      title: "Ask anything",
      description: "Ask a question about your documents",
      prompt: "Who is the author or issuing authority of this document?",
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isTyping) return;

    if (!activeDocument) {
      if (documents.length > 0) {
        setActiveDocument(documents[0]);
      } else {
        const warningMsg = {
          id: Date.now(),
          role: "assistant",
          content:
            "Please upload a college document in the Documents section before asking questions. The AI assistant uses grounded document search via FAISS and Groq.",
          sources: [],
        };
        setMessages((prev) => [
          ...prev,
          { id: Date.now() - 1, role: "user", content: question },
          warningMsg,
        ]);
        setInput("");
        return;
      }
    }

    const currentDoc = activeDocument || documents[0];
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setTypingStatus("Searching document chunks with FAISS...");

    try {
      const response = await askDocument(currentDoc.id, question);

      if (response && response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: response.answer,
          sources: response.sources || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
        handleQueryAsked(currentDoc.name, question);
      } else {
        throw new Error(response.detail || "Failed to retrieve answer.");
      }
    } catch (error) {
      console.error("Ask document error:", error);
      let errorText =
        "Unable to generate an answer. Please verify the FastAPI backend is running and that Groq API key is configured in .env.";
      if (error.response?.data?.detail) {
        errorText = error.response.data.detail;
      } else if (error.message) {
        errorText = error.message;
      }

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${errorText}`,
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (prompt) => {
    if (!prompt) {
      inputRef.current?.focus();
      return;
    }

    setInput(prompt);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const speakMessage = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="assistant-page">
      {/* =========================
          HEADER
      ========================== */}
      <header className="assistant-header">
        <div className="assistant-title-area">
          <div className="assistant-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <div className="assistant-title-row">
              <h1>AI Assistant</h1>

              <span className="ai-online-badge">
                <span
                  className="online-dot"
                  style={{
                    background: isBackendOnline ? "#22c55e" : "#e11d48",
                  }}
                ></span>
                {isBackendOnline ? "AI Online" : "Connecting..."}
              </span>
            </div>

            <p>
              Ask questions and understand your college documents with grounded AI.
            </p>
          </div>
        </div>

        <button className="new-chat-button" onClick={clearChat}>
          <Plus size={17} />
          <span>New Chat</span>
        </button>
      </header>

      {/* =========================
          MAIN WORKSPACE
      ========================== */}
      <div className="assistant-workspace">
        {/* =========================
            CHAT
        ========================== */}
        <main className="chat-container">
          {messages.length === 0 ? (
            <div className="assistant-empty-state">
              <div className="large-ai-icon">
                <Sparkles size={32} />
              </div>

              <div className="empty-title">
                <h2>Ask your college documents anything.</h2>
                <p>
                  {activeDocument
                    ? `Ready to answer questions about "${activeDocument.name}".`
                    : "Upload or select a college document to search content, extract rules and get grounded answers."}
                </p>
              </div>

              <div className="suggestion-grid">
                {suggestedQuestions.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={index}
                      className="suggestion-card"
                      onClick={() => handleSuggestedQuestion(item.prompt)}
                    >
                      <div className="suggestion-icon">
                        <Icon size={18} />
                      </div>

                      <div className="suggestion-content">
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-row ${
                    message.role === "user"
                      ? "user-message-row"
                      : "assistant-message-row"
                  }`}
                >
                  <div
                    className={`message-avatar ${
                      message.role === "user" ? "user-avatar" : "ai-avatar"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User size={16} />
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </div>

                  <div className="message-content">
                    <div className="message-name">
                      {message.role === "user" ? "You" : "AI ECMS Assistant"}
                    </div>

                    <div className="message-bubble">{message.content}</div>

                    {message.role === "assistant" && message.sources?.length > 0 && (
                      <>
                        <div className="sources-section">
                          <div className="sources-header">
                            <FileText size={14} />
                            Retrieved Sources ({message.sources.length})
                          </div>

                          {message.sources.map((source, index) => (
                            <div className="source-card" key={index}>
                              <div className="source-file-icon">
                                <FileText size={14} />
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <strong>{source.title || activeDocument?.name}</strong>
                                <span>
                                  {source.page || `Page ${source.page_number}`}
                                  {source.score ? ` • Relevance: ${Math.round(source.score * 100)}%` : ""}
                                </span>
                                {source.text && (
                                  <p
                                    style={{
                                      fontSize: "11px",
                                      color: "var(--text-secondary, #71717a)",
                                      marginTop: "4px",
                                      lineHeight: "1.4",
                                      maxHeight: "60px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    "{source.text.slice(0, 140)}..."
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="message-actions">
                          <button
                            onClick={() => copyMessage(message.content)}
                            title="Copy"
                          >
                            <Copy size={14} />
                          </button>

                          <button
                            onClick={() => speakMessage(message.content)}
                            title="Listen"
                          >
                            <Volume2 size={14} />
                          </button>

                          <button title="Helpful">
                            <ThumbsUp size={14} />
                          </button>

                          <button title="Not helpful">
                            <ThumbsDown size={14} />
                          </button>

                          <button title="More">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="message-row">
                  <div className="message-avatar ai-avatar">
                    <Sparkles size={16} />
                  </div>

                  <div className="message-content">
                    <div className="message-name">AI ECMS Assistant</div>

                    <div className="typing-bubble">
                      <span></span>
                      <span></span>
                      <span></span>
                      <small>{typingStatus}</small>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef}></div>
            </div>
          )}

          {/* =========================
              INPUT
          ========================== */}
          <div className="chat-input-area">
            <div className="document-selector">
              <button
                className="document-selector-button"
                onClick={() => setShowDocuments(!showDocuments)}
              >
                <FileText size={15} />
                <span>
                  {activeDocument ? activeDocument.name : (documents.length > 0 ? "Select Document" : "No Document Uploaded")}
                </span>
                <ChevronDown size={14} />
              </button>

              {showDocuments && (
                <div className="document-dropdown">
                  {documents.length === 0 ? (
                    <div style={{ padding: "10px", fontSize: "12px", color: "#a1a1aa" }}>
                      No documents available. Upload in Documents tab.
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <button
                        key={doc.id}
                        className={activeDocument?.id === doc.id ? "selected-document" : ""}
                        onClick={() => {
                          setActiveDocument(doc);
                          setShowDocuments(false);
                        }}
                      >
                        <FileText size={14} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeDocument
                    ? `Ask anything about "${activeDocument.name}"...`
                    : "Upload a document or select one to ask questions..."
                }
                rows="1"
              />

              <button
                className={`send-button ${input.trim() ? "send-active" : ""}`}
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                {isTyping ? (
                  <Loader2 size={18} className="spin-icon" style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <div className="input-disclaimer">
              <ShieldCheck size={12} />
              <span>
                AI responses are strictly grounded on retrieved document content from FAISS & Groq.
              </span>
            </div>
          </div>
        </main>

        {/* =========================
            RIGHT PANEL
        ========================== */}
        <aside className="assistant-info-panel">
          <div className="info-panel-header">
            <div>
              <span className="panel-label">AI KNOWLEDGE</span>
              <h3>Document Context</h3>
            </div>

            <button>
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="context-card">
            <div className="context-card-icon">
              <FileText size={18} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <span>Selected Source</span>
              <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeDocument ? activeDocument.name : "None selected"}
              </strong>
              {activeDocument && (
                <small style={{ display: "block", color: "var(--text-secondary, #71717a)", marginTop: "2px" }}>
                  {activeDocument.pages} pages • {activeDocument.language || "English"}
                </small>
              )}
            </div>
          </div>

          <div className="context-divider"></div>

          <div className="retrieval-info">
            <div className="retrieval-header">
              <Search size={16} />
              How AI answers
            </div>

            <div className="retrieval-step">
              <div className="step-number">1</div>
              <div>
                <strong>Understand</strong>
                <p>Your question is analyzed & converted to embeddings.</p>
              </div>
            </div>

            <div className="retrieval-connector"></div>

            <div className="retrieval-step">
              <div className="step-number">2</div>
              <div>
                <strong>Retrieve</strong>
                <p>FAISS finds the top relevant document chunks.</p>
              </div>
            </div>

            <div className="retrieval-connector"></div>

            <div className="retrieval-step">
              <div className="step-number">3</div>
              <div>
                <strong>Generate</strong>
                <p>Groq generates a grounded answer with citations.</p>
              </div>
            </div>
          </div>

          <div className="grounded-card">
            <div className="grounded-icon">
              <ShieldCheck size={17} />
            </div>

            <div>
              <strong>Grounded AI</strong>
              <p>Responses are based on retrieved college document content.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Assistant;