import React from "react";
import {
  FilePlus,
  Wand2,
  CheckCheck,
  Languages,
  ShieldCheck,
  UserCheck,
  Share2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import "./WorkflowTracker.css";

const STAGES = [
  { id: "PRODUCT", label: "Product Specs", icon: FilePlus },
  { id: "DRAFT", label: "Draft Agent", icon: Wand2 },
  { id: "REVIEW", label: "Review Agent", icon: CheckCheck },
  { id: "LOCALIZATION", label: "Localization", icon: Languages },
  { id: "COMPLIANCE", label: "Compliance", icon: ShieldCheck },
  { id: "APPROVAL", label: "Manager Approval", icon: UserCheck },
  { id: "PUBLISHING", label: "Publishing", icon: Share2 },
];

function WorkflowTracker({ currentStage = "DRAFT", status = "PENDING_APPROVAL" }) {
  // Determine index of current stage
  const stageOrder = ["PRODUCT", "DRAFT", "REVIEW", "LOCALIZATION", "COMPLIANCE", "APPROVAL", "PUBLISHING"];
  
  let activeIndex = 1;
  if (currentStage === "PRODUCT") activeIndex = 0;
  else if (currentStage === "DRAFT") activeIndex = 1;
  else if (currentStage === "REVIEW") activeIndex = 2;
  else if (currentStage === "LOCALIZATION") activeIndex = 3;
  else if (currentStage === "COMPLIANCE") activeIndex = 4;
  else if (currentStage === "HUMAN_APPROVAL" || currentStage === "APPROVAL") activeIndex = 5;
  else if (currentStage === "PUBLISHING") activeIndex = 6;

  if (status === "APPROVED" || status === "PUBLISHED") {
    activeIndex = 6;
  }

  return (
    <div className="workflow-tracker-box">
      <div className="workflow-tracker-header">
        <div>
          <h4>Multi-Agent Pipeline Progression</h4>
          <p>Autonomous sequential agent validation pipeline</p>
        </div>
        <div className={`workflow-status-pill ${status.toLowerCase()}`}>
          {status === "APPROVED" && <CheckCircle2 size={14} />}
          {status === "REJECTED" && <XCircle size={14} />}
          {status === "PENDING_APPROVAL" && <Clock size={14} />}
          {status === "PUBLISHED" && <CheckCircle2 size={14} />}
          <span>{status.replace("_", " ")}</span>
        </div>
      </div>

      <div className="workflow-steps-line">
        {STAGES.map((stg, index) => {
          const Icon = stg.icon;
          const isCompleted = index < activeIndex || (index === activeIndex && (status === "APPROVED" || status === "PUBLISHED"));
          const isCurrent = index === activeIndex && status !== "APPROVED" && status !== "PUBLISHED";
          const isPending = index > activeIndex;

          return (
            <React.Fragment key={stg.id}>
              <div
                className={`tracker-step ${
                  isCompleted ? "completed" : isCurrent ? "current" : "pending"
                }`}
              >
                <div className="tracker-circle">
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                </div>
                <span className="tracker-label">{stg.label}</span>
              </div>
              {index < STAGES.length - 1 && (
                <div
                  className={`tracker-connector ${
                    index < activeIndex ? "active" : ""
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default WorkflowTracker;
