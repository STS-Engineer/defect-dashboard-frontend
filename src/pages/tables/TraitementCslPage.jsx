import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { getAllSupervisors, normalizeSuperviseurValue } from "../../constants/lineConfig";
import CslTreatmentForm from "../../components/CslTreatmentForm";
import StatusBadge from "../../components/StatusBadge";

const initialForm = {
  securisation: "",
  poste_occurrence: "",
  poste_detection: "",
  root_cause_occurrence: "",
  root_cause_non_detection: "",
  plan_action_occurrence: "",
  plan_action_non_detection: "",
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("fr-FR");
};

export default function TraitementCslPage() {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const supervisors = useMemo(
    () => getAllSupervisors().sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" })),
    []
  );

  const openCslDefects = useMemo(() => {
    const allowed = new Set(["OUVERT", "RETOUR_PRODUCTION", "RETOUR_QUALITE"]);
    return defects.filter((defect) => allowed.has(defect.status) && defect.poste === "CSL1");
  }, [defects]);

  const filteredDefects = useMemo(
    () =>
      selectedSupervisor
        ? openCslDefects.filter(
            (defect) => normalizeSuperviseurValue(defect.equipe) === selectedSupervisor
          )
        : [],
    [openCslDefects, selectedSupervisor]
  );

  useEffect(() => {
    loadDefects();
  }, []);

  async function loadDefects() {
    setLoading(true);
    try {
      const res = await api.get("/defects");
      setDefects(res.data || []);
    } catch (err) {
      setError("Impossible de charger les incidents. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }

  function handleSupervisorChange(event) {
    setSelectedSupervisor(event.target.value);
    setSelectedDefect(null);
    setFormData(initialForm);
    setError("");
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleStartTreatment(defect) {
    setSelectedDefect(defect);
    setFormData(initialForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedDefect) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.patch(`/defects/${selectedDefect.id}`, formData);
      console.log("✅ PATCH succeeded:", response.status);
      await loadDefects();
      setSelectedDefect(null);
      setFormData(initialForm);
    } catch (err) {
      console.error("❌ PATCH failed:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        isCORSError: err.message.includes("CORS"),
      });
      setError("Impossible d'enregistrer le traitement. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Traitement CSL</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Affiche uniquement les incidents CSL1 ouverts par superviseur.
          </p>
        </div>
      </div>
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="table-toolbar">
          <div>
            <label htmlFor="supervisor-select">Superviseur</label>
            <select id="supervisor-select" value={selectedSupervisor} onChange={handleSupervisorChange}>
              <option value="">Choisir un superviseur</option>
              {supervisors.map((supervisor) => (
                <option key={supervisor} value={supervisor}>
                  {supervisor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">Chargement des incidents...</div>
      ) : (
        <>
          {selectedSupervisor ? (
            <div className="card" style={{ marginBottom: "24px" }}>
              {filteredDefects.length === 0 ? (
                <div>Aucun incident CSL1 ouvert pour ce superviseur</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Ligne</th>
                        <th>Défaut</th>
                        <th>Superviseur</th>
                        <th>Status</th>
                        <th>Commentaire</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDefects.map((defect) => (
                        <tr key={defect.id}>
                          <td>{defect.id}</td>
                          <td>{formatDate(defect.date_detection)}</td>
                          <td>{defect.bu || "-"}</td>
                          <td>{defect.ligne || "-"}</td>
                          <td>{defect.defaut || "-"}</td>
                          <td>{normalizeSuperviseurValue(defect.equipe)}</td>
                          <td><StatusBadge status={defect.status} /></td>
                          <td>{defect.status === 'RETOUR_PRODUCTION' ? defect.prod_validation_comment : defect.status === 'RETOUR_QUALITE' ? defect.quality_validation_comment : ''}</td>
                          <td>
                            <button type="button" onClick={() => handleStartTreatment(defect)}>
                              Traiter
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="card">Sélectionnez un superviseur pour afficher les incidents.</div>
          )}

          {error && (
            <div className="card" style={{ border: "1px solid #fca5a5", background: "#fef2f2", color: "#b91c1c" }}>
              {error}
            </div>
          )}

          {selectedDefect && (
            <CslTreatmentForm
              defect={selectedDefect}
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onCancel={() => setSelectedDefect(null)}
              submitting={submitting}
            />
          )}
        </>
      )}
    </div>
  );
}
