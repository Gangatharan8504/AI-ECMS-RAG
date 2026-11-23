import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
} from "lucide-react";
import { getComplianceRules, updateComplianceRules } from "../../services/api";
import "./AgentPages.css";

function ComplianceSettingsPage() {
  const [rules, setRules] = useState({
    brand_guidelines: "",
    company_terminology: "",
    restricted_words: "",
    required_disclaimers: "",
    regulatory_rules: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRules = async () => {
    try {
      const res = await getComplianceRules();
      if (res.success && res.rules) {
        setRules({
          brand_guidelines: res.rules.brand_guidelines || "",
          company_terminology: res.rules.company_terminology || "",
          restricted_words: res.rules.restricted_words || "",
          required_disclaimers: res.rules.required_disclaimers || "",
          regulatory_rules: res.rules.regulatory_rules || "",
        });
      }
    } catch (err) {
      console.error("Fetch compliance rules error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRules((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await updateComplianceRules(rules);
      if (res.success) {
        setSuccessMsg("Brand & compliance parameters successfully updated and enforced!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      alert("Failed to update rules.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="agent-page-container">
      <div className="agent-page-header">
        <div>
          <div className="agent-badge-pill">
            <ShieldCheck size={13} />
            <span>GOVERNANCE & POLICY</span>
          </div>
          <h1>Compliance Rules & Brand Guidelines</h1>
          <p>
            Configure company guidelines, restricted terminology, legal disclaimers, and regulatory limits enforced by the AI Compliance Agent.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="agent-alert success">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="agent-loading">Loading rules...</div>
      ) : (
        <form className="agent-form-card" onSubmit={handleSave}>
          <div className="form-group">
            <label>Brand Guidelines & Tone of Voice</label>
            <textarea
              rows="3"
              name="brand_guidelines"
              value={rules.brand_guidelines}
              onChange={handleChange}
              placeholder="e.g. Professional, user-first, innovative, transparent..."
            />
          </div>

          <div className="form-group">
            <label>Approved Company Terminology</label>
            <input
              type="text"
              name="company_terminology"
              value={rules.company_terminology}
              onChange={handleChange}
              placeholder="e.g. AI ECMS, Enterprise Content Intelligence, Neural Index"
            />
          </div>

          <div className="form-group">
            <label>Prohibited & Restricted Words (Comma separated)</label>
            <textarea
              rows="2"
              name="restricted_words"
              value={rules.restricted_words}
              onChange={handleChange}
              placeholder="e.g. guaranteed 100%, risk-free, cheat, hack, untraceable..."
            />
          </div>

          <div className="form-group">
            <label>Mandatory Legal Disclaimers</label>
            <textarea
              rows="3"
              name="required_disclaimers"
              value={rules.required_disclaimers}
              onChange={handleChange}
              placeholder="e.g. AI accuracy benchmarks vary depending on document structure..."
            />
          </div>

          <div className="form-group">
            <label>Regulatory & Compliance Policies</label>
            <textarea
              rows="3"
              name="regulatory_rules"
              value={rules.regulatory_rules}
              onChange={handleChange}
              placeholder="e.g. Strictly avoid unproven health/financial guarantees; comply with data privacy..."
            />
          </div>

          <div className="form-submit-row">
            <button type="submit" className="agent-btn primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? "Saving Guidelines..." : "Save Compliance Rules"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ComplianceSettingsPage;
