import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { normalizeSuperviseurValue } from "../../constants/lineConfig";

const QUALITY_VALIDATOR_NAME = "Responsable Qualite";

const treatmentFields = [
  { label: "Securisation", keys: ["treatment_securisation", "securisation"] },
  { label: "Poste d'occurrence", keys: ["treatment_poste_occurrence", "poste_occurrence"] },
  { label: "Poste de detection", keys: ["treatment_poste_detection", "poste_detection"] },
  { label: "Root cause de l'occurrence", keys: ["treatment_root_cause_occurrence", "root_cause_occurrence"] },
  { label: "Root cause de la non-detection", keys: ["treatment_root_cause_non_detection", "root_cause_non_detection"] },
  { label: "Plan d'action occurrence", keys: ["treatment_plan_action_occurrence", "plan_action_occurrence"] },
  { label: "Plan d'action non-detection", keys: ["treatment_plan_action_non_detection", "plan_action_non_detection"] },
];

function valueFrom(defect, keys, fallback = "-") {
  const keyList = Array.isArray(keys) ? keys : [keys];
  for (const key of keyList) {
    const value = defect?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return fallback;
}

function formatDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function productionDecision(defect) {
  return valueFrom(defect, ["treatment_prod_decision"], defect?.status === "ATT_VALIDATION_QUALITE" ? "Valid\u00e9" : "-");
}

async function postWithFallback(primaryUrl, fallbackUrl, payload) {
  try {
    return await api.post(primaryUrl, payload);
  } catch (error) {
    if (error?.response?.status !== 404) {
      throw error;
    }
    return api.post(fallbackUrl, payload);
  }
}

export default function ValidationQualitePage() {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [decision, setDecision] = useState("validate");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/defects", { params: { status: "ATT_VALIDATION_QUALITE" } });
      const nextDefects = res.data || [];
      setDefects(nextDefects);
      setSelectedId((current) => {
        if (current && nextDefects.some((defect) => defect.id === current)) {
          return current;
        }
        return nextDefects[0]?.id ?? null;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const selected = useMemo(
    () => defects.find((defect) => defect.id === selectedId) || defects[0] || null,
    [defects, selectedId]
  );

  function chooseIncident(defect) {
    setSelectedId(defect.id);
    setDecision("validate");
    setRemarks("");
  }

  async function submitDecision() {
    if (!selected) return;
    if (decision === "reject" && !remarks.trim()) {
      window.alert("Entrez les remarques de refus.");
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      quality_validator_name: QUALITY_VALIDATOR_NAME,
      quality_validation_comment: remarks.trim(),
      treatment_quality_validator_name: QUALITY_VALIDATOR_NAME,
      treatment_quality_validation_date: now,
      treatment_quality_decision: decision === "validate" ? "Valid\u00e9" : "Refus\u00e9",
      treatment_quality_remarks: remarks.trim(),
      treatment_status: decision === "validate" ? "Valid\u00e9" : "Refus\u00e9",
    };

    if (decision === "validate") {
      await postWithFallback(
        `/defects/${selected.id}/quality-validation`,
        `/defects/${selected.id}/validate-quality`,
        payload
      );
    } else {
      await postWithFallback(
        `/defects/${selected.id}/quality-validation`,
        `/defects/${selected.id}/reject-quality`,
        payload
      );
    }

    setDecision("validate");
    setRemarks("");
    await load();
  }

  return (
    <div className="page-content validation-review-page">
      <div className="page-header-toolbar">
        <div>
          <h1>Validation Qualite</h1>
          <p className="help-text">Revisez le traitement et la validation production avant decision qualite.</p>
        </div>
      </div>

      {loading ? (
        <div className="card">Chargement...</div>
      ) : defects.length === 0 ? (
        <div className="empty-state">Aucun incident en attente de validation qualite.</div>
      ) : (
        <div className="validation-review-layout">
          <aside className="incident-list">
            {defects.map((defect) => (
              <button
                key={defect.id}
                type="button"
                className={`incident-list-item ${selected?.id === defect.id ? "active" : ""}`}
                onClick={() => chooseIncident(defect)}
              >
                <strong>Incident #{defect.id}</strong>
                <span>{valueFrom(defect, "defaut")}</span>
                <small>
                  {valueFrom(defect, ["bu", "client"])} | {valueFrom(defect, "ligne")}
                </small>
              </button>
            ))}
          </aside>

          <section className="review-panel">
            <div className="review-card">
              <h2>Incident #{selected.id}</h2>
              <div className="review-meta-grid">
                <div><span>Defaut</span><strong>{valueFrom(selected, "defaut")}</strong></div>
                <div><span>Client</span><strong>{valueFrom(selected, ["bu", "client"])}</strong></div>
                <div><span>Ligne</span><strong>{valueFrom(selected, "ligne")}</strong></div>
                <div><span>Poste</span><strong>{valueFrom(selected, "poste")}</strong></div>
                <div><span>Superviseur</span><strong>{normalizeSuperviseurValue(valueFrom(selected, ["superviseur", "equipe"]))}</strong></div>
                <div><span>Date traitement</span><strong>{formatDate(valueFrom(selected, "treatment_date", ""))}</strong></div>
              </div>
            </div>

            <div className="review-card">
              <h2>Traitement Superviseur</h2>
              <div className="treatment-field-list">
                {treatmentFields.map((field) => (
                  <div className="treatment-field" key={field.label}>
                    <span>{field.label}</span>
                    <p>{valueFrom(selected, field.keys)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="review-card">
              <h2>Validation Production</h2>
              <div className="review-meta-grid compact">
                <div><span>Decision</span><strong>{productionDecision(selected)}</strong></div>
                <div><span>Validateur</span><strong>{valueFrom(selected, ["treatment_prod_validator_name", "prod_validator_name"])}</strong></div>
                <div><span>Date</span><strong>{formatDate(valueFrom(selected, "treatment_prod_validation_date", ""))}</strong></div>
                <div><span>Remarques</span><strong>{valueFrom(selected, ["treatment_prod_remarks", "prod_validation_comment"])}</strong></div>
              </div>
            </div>

            <div className="review-card">
              <h2>Decision</h2>
              <div className="decision-toggle">
                <button
                  type="button"
                  className={decision === "validate" ? "active" : "secondary"}
                  onClick={() => setDecision("validate")}
                >
                  Valider
                </button>
                <button
                  type="button"
                  className={decision === "reject" ? "danger active" : "secondary"}
                  onClick={() => setDecision("reject")}
                >
                  Refuser
                </button>
              </div>

              {decision === "reject" && (
                <label className="remarks-field">
                  Remarques de refus *
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </label>
              )}

              <button type="button" onClick={submitDecision}>
                Envoyer la decision
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
