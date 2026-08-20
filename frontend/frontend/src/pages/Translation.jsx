import React, { useState, useEffect } from "react";
import {
  Languages,
  Sparkles,
  FileText,
  Volume2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeftRight,
  ChevronDown,
  Globe2,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

import "./Translation.css";
import { useDocuments } from "../context/DocumentContext";
import { translateText } from "../services/api";

const Translation = () => {
  const {
    documents,
    activeDocument,
    setActiveDocument,
    handleTranslationPerformed,
  } = useDocuments();

  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Tamil");
  const [showDocuments, setShowDocuments] = useState(false);
  const [showSourceLanguages, setShowSourceLanguages] = useState(false);
  const [showTargetLanguages, setShowTargetLanguages] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const languages = [
    "English",
    "Tamil",
    "Hindi",
    "Telugu",
    "Malayalam",
    "Kannada",
    "French",
    "German",
    "Spanish",
  ];

  // Sync detected document language if activeDocument changes
  useEffect(() => {
    if (activeDocument?.language && activeDocument.language !== "Unknown") {
      setSourceLanguage(activeDocument.language);
    }
  }, [activeDocument]);

  const getDocumentPreviewText = () => {
    if (!activeDocument) return "";
    if (activeDocument.summary && activeDocument.summary !== "Summary generation unavailable (check Groq API key).") {
      return activeDocument.summary;
    }
    if (activeDocument.rawPages && activeDocument.rawPages.length > 0) {
      return activeDocument.rawPages.map((p) => p.text).join("\n\n").slice(0, 3000);
    }
    return `Document: ${activeDocument.name}\nPages: ${activeDocument.pages}\nLanguage: ${activeDocument.language}`;
  };

  const handleTranslate = async () => {
    if (!activeDocument) {
      alert("Please select a document to translate.");
      return;
    }

    const textToTranslate = getDocumentPreviewText();
    if (!textToTranslate.trim()) {
      setErrorMessage("No text available in the selected document to translate.");
      return;
    }

    setIsTranslating(true);
    setErrorMessage("");

    try {
      const response = await translateText(textToTranslate, targetLanguage);
      if (response && response.success) {
        setTranslatedText(response.translation);
        handleTranslationPerformed(activeDocument.name, targetLanguage);
      } else {
        throw new Error(response.detail || "Translation request failed.");
      }
    } catch (error) {
      console.error("Translation error:", error);
      let detail = "Unable to connect to AI ECMS translation service.";
      if (error.response?.data?.detail) {
        detail = error.response.data.detail;
      } else if (error.message) {
        detail = error.message;
      }
      setErrorMessage(detail);
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    const oldSource = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(oldSource);
    setTranslatedText("");
  };

  const copyTranslation = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const speakTranslation = () => {
    if (!translatedText || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const voiceMap = {
      English: "en-US",
      Tamil: "ta-IN",
      Hindi: "hi-IN",
      Telugu: "te-IN",
      Malayalam: "ml-IN",
      Kannada: "kn-IN",
      French: "fr-FR",
      German: "de-DE",
      Spanish: "es-ES",
    };

    const speech = new SpeechSynthesisUtterance(translatedText);
    speech.lang = voiceMap[targetLanguage] || "en-US";
    window.speechSynthesis.speak(speech);
  };

  const speakOriginal = () => {
    const text = getDocumentPreviewText();
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="translation-page">
      {/* =====================================
          HEADER
      ====================================== */}
      <header className="translation-header">
        <div className="translation-heading">
          <div className="translation-title-icon">
            <Languages size={22} />
          </div>

          <div>
            <div className="translation-title-row">
              <h1>Translation</h1>
              <span className="translation-ai-badge">
                <Sparkles size={11} />
                AI Powered
              </span>
            </div>

            <p>
              Translate college documents and AI answers into your preferred language.
            </p>
          </div>
        </div>

        <div className="translation-status">
          <span className="translation-status-dot"></span>
          <span>Translation Engine Ready</span>
        </div>
      </header>

      {/* =====================================
          HERO
      ====================================== */}
      <section className="translation-hero">
        <div className="translation-hero-content">
          <div className="translation-hero-badge">
            <Globe2 size={13} />
            COLLEGE LANGUAGE INTELLIGENCE
          </div>

          <h2>
            Understand college content
            <span> in your language.</span>
          </h2>

          <p>
            AI ECMS detects the source language of your documents and translates academic,
            examination, placement and policy content using Groq LLMs.
          </p>

          <div className="translation-supported">
            <span>Supported languages</span>
            <div className="language-pills">
              {languages.map((language) => (
                <span key={language} className="language-pill">
                  {language}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="translation-hero-visual">
          <div className="translation-glow"></div>
          <div className="translation-orbit orbit-a"></div>
          <div className="translation-orbit orbit-b"></div>

          <div className="translation-core">
            <Languages size={31} />
          </div>

          <div className="translation-floating floating-left">EN</div>
          <div className="translation-floating floating-right">தமிழ்</div>
        </div>
      </section>

      {/* =====================================
          DOCUMENT SELECTOR
      ====================================== */}
      <section className="translation-document-bar">
        <div className="document-selection">
          <div className="document-selection-icon">
            <FileText size={18} />
          </div>

          <div className="document-selection-info">
            <span>SOURCE DOCUMENT</span>
            <strong>
              {activeDocument ? activeDocument.name : "Select a document to translate"}
            </strong>
          </div>

          <div className="document-select-wrapper">
            <button
              className="document-select-button"
              onClick={() => setShowDocuments(!showDocuments)}
            >
              <span>Choose Document</span>
              <ChevronDown size={15} />
            </button>

            {showDocuments && (
              <div className="translation-dropdown">
                {documents.length === 0 ? (
                  <div style={{ padding: "10px", fontSize: "12px", color: "#a1a1aa" }}>
                    No documents uploaded yet.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setActiveDocument(doc);
                        setShowDocuments(false);
                        setTranslatedText("");
                      }}
                      className={activeDocument?.id === doc.id ? "dropdown-selected" : ""}
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
        </div>
      </section>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "10px",
            background: "rgba(225, 29, 72, 0.08)",
            border: "1px solid #fecdd3",
            color: "#be123c",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* =====================================
          LANGUAGE CONTROLS
      ====================================== */}
      <section className="language-control-card">
        <div className="language-control-heading">
          <div>
            <span className="control-eyebrow">TRANSLATION SETTINGS</span>
            <h3>Choose your languages</h3>
          </div>

          <div className="auto-detect-badge">
            <Sparkles size={12} />
            AI Detection Ready
          </div>
        </div>

        <div className="language-controls">
          {/* SOURCE */}
          <div className="language-selector">
            <label>Source Language</label>

            <button
              className="language-select"
              onClick={() => setShowSourceLanguages(!showSourceLanguages)}
            >
              <div className="language-select-left">
                <div className="language-select-icon">
                  <Globe2 size={16} />
                </div>
                <div>
                  <span>Detected Language</span>
                  <strong>{sourceLanguage}</strong>
                </div>
              </div>
              <ChevronDown size={15} />
            </button>

            {showSourceLanguages && (
              <div className="language-dropdown">
                {languages.map((language) => (
                  <button
                    key={language}
                    onClick={() => {
                      setSourceLanguage(language);
                      setShowSourceLanguages(false);
                      setTranslatedText("");
                    }}
                  >
                    {language}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SWAP */}
          <button
            className="swap-language-button"
            onClick={swapLanguages}
            title="Swap languages"
          >
            <ArrowLeftRight size={17} />
          </button>

          {/* TARGET */}
          <div className="language-selector">
            <label>Target Language</label>

            <button
              className="language-select"
              onClick={() => setShowTargetLanguages(!showTargetLanguages)}
            >
              <div className="language-select-left">
                <div className="language-select-icon target-icon">
                  <Languages size={16} />
                </div>
                <div>
                  <span>Translate Into</span>
                  <strong>{targetLanguage}</strong>
                </div>
              </div>
              <ChevronDown size={15} />
            </button>

            {showTargetLanguages && (
              <div className="language-dropdown">
                {languages
                  .filter((lang) => lang !== sourceLanguage)
                  .map((language) => (
                    <button
                      key={language}
                      onClick={() => {
                        setTargetLanguage(language);
                        setShowTargetLanguages(false);
                        setTranslatedText("");
                      }}
                    >
                      {language}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="translation-action-row">
          <div className="translation-note">
            <ShieldCheck size={14} />
            <span>Translation preserves technical academic context and terms.</span>
          </div>

          <button
            className="translate-button"
            onClick={handleTranslate}
            disabled={!activeDocument || isTranslating}
          >
            {isTranslating ? (
              <>
                <Loader2 size={16} className="translation-spinner" />
                Translating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Translate Document
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </section>

      {/* =====================================
          TRANSLATION WORKSPACE
      ====================================== */}
      <section className="translation-workspace">
        {/* ORIGINAL */}
        <div className="translation-panel">
          <div className="translation-panel-header">
            <div>
              <span className="panel-language-label">{sourceLanguage.toUpperCase()}</span>
              <h3>Original Content</h3>
            </div>

            <div className="panel-header-actions">
              <button
                title="Listen to original"
                onClick={speakOriginal}
                disabled={!activeDocument}
              >
                <Volume2 size={15} />
              </button>
            </div>
          </div>

          <div className="translation-content">
            {!activeDocument ? (
              <div className="translation-empty">
                <div className="translation-empty-icon">
                  <FileText size={23} />
                </div>
                <strong>Select a document</strong>
                <p>Choose an uploaded college document to view and translate its content.</p>
              </div>
            ) : (
              <div className="document-preview" style={{ maxHeight: "320px", overflowY: "auto" }}>
                <div className="preview-section">
                  <span>DOCUMENT PREVIEW ({activeDocument.name})</span>
                </div>
                <p style={{ whiteSpace: "pre-wrap", fontSize: "13px", lineHeight: "1.6" }}>
                  {getDocumentPreviewText()}
                </p>
              </div>
            )}
          </div>

          <div className="panel-footer">
            <span>
              {activeDocument
                ? `${activeDocument.pages} pages • ${activeDocument.language || "English"}`
                : "No document selected"}
            </span>
          </div>
        </div>

        {/* TRANSLATED */}
        <div className="translation-panel translated-panel">
          <div className="translation-panel-header">
            <div>
              <span className="panel-language-label translated-label">
                {targetLanguage.toUpperCase()}
              </span>
              <h3>AI Translation</h3>
            </div>

            <div className="panel-header-actions">
              <button
                onClick={copyTranslation}
                disabled={!translatedText}
                title="Copy translation"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>

              <button
                onClick={speakTranslation}
                disabled={!translatedText}
                title="Listen"
              >
                <Volume2 size={15} />
              </button>
            </div>
          </div>

          <div className="translation-content">
            {!translatedText ? (
              <div className="translation-empty">
                <div className="translation-empty-icon rose-icon">
                  <Sparkles size={23} />
                </div>
                <strong>Translation will appear here</strong>
                <p>Select a document and target language, then click Translate Document.</p>
              </div>
            ) : (
              <div className="translated-result" style={{ maxHeight: "320px", overflowY: "auto" }}>
                <div className="result-status">
                  <div className="result-status-icon">
                    <Check size={15} />
                  </div>
                  <div>
                    <strong>Translation completed</strong>
                    <span>
                      {sourceLanguage} → {targetLanguage}
                    </span>
                  </div>
                </div>

                <div className="translated-placeholder" style={{ whiteSpace: "pre-wrap" }}>
                  {translatedText}
                </div>
              </div>
            )}
          </div>

          <div className="panel-footer">
            <span>
              {translatedText ? `Translated into ${targetLanguage}` : "Awaiting translation"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Translation;