import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wand2,
  FileText,
  Upload,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { runAgentWorkflow } from "../../services/api";
import "./AgentPages.css";

function ProductInputPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "AuraPhone Pro 16",
    category: "Smartphones & Mobile Tech",
    content_objective: "Product Launch & Feature Highlight",
    target_audience: "Tech-savvy professionals, mobile creators, and college students",
    description: "Next-generation flagship smartphone with 3nm AI neural processor, all-day battery life, and cinematic 8K camera system.",
    specs: "Display: 6.7-inch OLED 120Hz; Processor: Octa-core 3nm Neural SoC; Storage: 256GB / 512GB; Battery: 5000mAh with 65W fast charge; OS: AuraOS 4.0",
    features: "1. Triple 50MP AI camera with night-vision mode.\n2. On-device real-time language translation.\n3. Titanium edge chassis with IP68 water resistance.\n4. Intelligent battery optimization achieving 28 hours video playback.",
    customer_feedback: "Beta testers praised the instant translation and battery longevity. A few requested simpler dark mode settings in the camera app.",
    preferred_language: "English",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartWorkflow = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Product Name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await runAgentWorkflow(formData);
      if (res.success && res.workflow_id) {
        // Direct user to Draft Agent view or Manager Approval
        navigate(`/agents/approval?id=${res.workflow_id}`);
      } else {
        throw new Error(res.detail || "Failed to trigger multi-agent pipeline.");
      }
    } catch (err) {
      console.error("Workflow trigger error:", err);
      setError(
        err.response?.data?.detail || err.message || "Failed to initiate AI Content Workflow."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-page-container">
      <div className="agent-page-header">
        <div>
          <div className="agent-badge-pill">
            <Layers size={13} />
            <span>STAGE 1: INPUT SPECIFICATIONS</span>
          </div>
          <h1>Product Details & Objective</h1>
          <p>
            Provide detailed product parameters. The autonomous agent pipeline will generate, review, localize, and verify compliance automatically.
          </p>
        </div>
      </div>

      {error && (
        <div className="agent-alert error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form className="agent-form-card" onSubmit={handleStartWorkflow}>
        <div className="form-grid-2">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. AuraPhone Pro 16"
              required
            />
          </div>

          <div className="form-group">
            <label>Product Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Consumer Electronics"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Campaign Content Objective</label>
            <select
              name="content_objective"
              value={formData.content_objective}
              onChange={handleChange}
            >
              <option value="Product Launch & Feature Highlight">Product Launch & Feature Highlight</option>
              <option value="Conversion & E-Commerce Sales">Conversion & E-Commerce Sales</option>
              <option value="Social Media Engagement & Virality">Social Media Engagement & Virality</option>
              <option value="Technical Documentation & Whitepaper">Technical Documentation & Whitepaper</option>
              <option value="Customer Retention & Newsletter">Customer Retention & Newsletter</option>
            </select>
          </div>

          <div className="form-group">
            <label>Preferred Output Language</label>
            <select
              name="preferred_language"
              value={formData.preferred_language}
              onChange={handleChange}
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Hindi">Hindi</option>
              <option value="Telugu">Telugu</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Target Audience</label>
          <input
            type="text"
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            placeholder="e.g. College students, professionals, enterprise developers"
          />
        </div>

        <div className="form-group">
          <label>Product Description</label>
          <textarea
            rows="3"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="High-level product overview..."
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Technical Specifications</label>
            <textarea
              rows="4"
              name="specs"
              value={formData.specs}
              onChange={handleChange}
              placeholder="Hardware, software, dimensions, performance benchmarks..."
            />
          </div>

          <div className="form-group">
            <label>Key Features & Benefits</label>
            <textarea
              rows="4"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="List the unique selling propositions (USPs)..."
            />
          </div>
        </div>

        <div className="form-group">
          <label>Customer Feedback & Early Reviews (Optional)</label>
          <textarea
            rows="2"
            name="customer_feedback"
            value={formData.customer_feedback}
            onChange={handleChange}
            placeholder="Feedback from beta testers, early adopters, or focus groups..."
          />
        </div>

        <div className="form-submit-row">
          <button
            type="submit"
            className="agent-btn primary lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Running Multi-Agent Pipeline (Draft → Review → Localize → Compliance)...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Start AI Content Workflow</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductInputPage;
