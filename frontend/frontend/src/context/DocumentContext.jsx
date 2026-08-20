import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { listDocuments, getHealth } from "../services/api";

const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [activities, setActivities] = useState([]);
  const [queryCount, setQueryCount] = useState(0);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const addActivity = useCallback((title, description) => {
    const newActivity = {
      id: Date.now() + Math.random(),
      title,
      description,
      time: "Just now",
    };
    setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
  }, []);

  const refreshDocuments = useCallback(async () => {
    try {
      setIsLoadingDocs(true);
      const data = await listDocuments();
      if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents);
        setIsBackendOnline(true);
        // If activeDocument is not set, set the first one
        setActiveDocument((current) => {
          if (!current && data.documents.length > 0) {
            return data.documents[0];
          }
          if (current) {
            const found = data.documents.find((d) => d.id === current.id);
            return found || data.documents[0] || null;
          }
          return null;
        });
      }
    } catch (err) {
      console.warn("Backend list documents error:", err.message);
      setIsBackendOnline(false);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const data = await getHealth();
      if (data && data.status === "healthy") {
        setIsBackendOnline(true);
      }
    } catch {
      setIsBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    refreshDocuments();
    const interval = setInterval(() => {
      checkHealth();
    }, 15000);
    return () => clearInterval(interval);
  }, [checkHealth, refreshDocuments]);

  const handleDocumentUploaded = useCallback((processedDoc) => {
    // Standardize structure
    const docItem = {
      id: processedDoc.document.id,
      name: processedDoc.document.name,
      category: processedDoc.document.category || "Academic Document",
      pages: processedDoc.document.page_count,
      word_count: processedDoc.document.word_count,
      character_count: processedDoc.document.character_count,
      language: processedDoc.document.language,
      status: "Processed",
      summary: processedDoc.summary,
      key_topics: processedDoc.key_topics,
      risks: processedDoc.risks,
      rawPages: processedDoc.pages,
    };

    setDocuments((prev) => [docItem, ...prev.filter((d) => d.id !== docItem.id)]);
    setActiveDocument(docItem);
    addActivity("Document Processed", `Analyzed ${docItem.name} (${docItem.pages} pages)`);
  }, [addActivity]);

  const handleQueryAsked = useCallback((docName, question) => {
    setQueryCount((prev) => prev + 1);
    addActivity("AI Query Answered", `Searched ${docName || "document"} for "${question.slice(0, 30)}..."`);
  }, [addActivity]);

  const handleTranslationPerformed = useCallback((docName, targetLang) => {
    addActivity("Content Translated", `Translated content from ${docName || "document"} into ${targetLang}`);
  }, [addActivity]);

  // Derived stats
  const totalPages = documents.reduce((sum, d) => sum + (Number(d.pages) || 0), 0);
  const uniqueLanguages = Array.from(
    new Set(documents.map((d) => d.language).filter((l) => Boolean(l) && l !== "Unknown"))
  );

  return (
    <DocumentContext.Provider
      value={{
        documents,
        setDocuments,
        activeDocument,
        setActiveDocument,
        activities,
        queryCount,
        isBackendOnline,
        isLoadingDocs,
        totalPages,
        uniqueLanguages,
        refreshDocuments,
        handleDocumentUploaded,
        handleQueryAsked,
        handleTranslationPerformed,
        addActivity,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
}
