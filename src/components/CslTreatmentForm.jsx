import React from "react";
import { normalizeSuperviseurValue } from "../constants/lineConfig";

const fields = [
  { key: "securisation", label: "Sécurisation" },
  { key: "poste_occurrence", label: "Poste d'occurrence" },
  { key: "poste_detection", label: "Poste de détection" },
  { key: "root_cause_occurrence", label: "Cause racine d'occurrence" },
  { key: "root_cause_non_detection", label: "Cause racine de non détection" },
  { key: "plan_action_occurrence", label: "Plan d'action d'occurrence" },
  { key: "plan_action_non_detection", label: "Plan d'action de non détection" },
];

export default function CslTreatmentForm({ defect, formData, onChange, onSubmit, onCancel, submitting }) {
  return (
    <div className="card" style={{ marginTop: "24px" }}>
      <div className="toolbar" style={{ alignItems: "flex-start", flexDirection: "column" }}>
        <div style={{ marginBottom: "12px" }}>
          <h2 style={{ margin: 0 }}>Traitement de l'incident #{defect.id}</h2>
          <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
            Superviseur : {normalizeSuperviseurValue(defect.equipe)}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="form-card">
        <div className="form-grid">
          {fields.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key}>{field.label}</label>
              <input
                id={field.key}
                name={field.key}
                value={formData[field.key]}
                onChange={onChange}
                required
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button type="submit" disabled={submitting}>
            Envoyer pour validation production
          </button>
          <button type="button" className="secondary" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
