import { useState } from "react";
import { api } from "../api";
import { getLinesByClient, getSupervisorsByLine } from "../constants/lineConfig";

export default function AddElementForm({
  title,
  columns,
  groups,
  selectedGroup,
  postEndpoint,
  onSaved,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    monday_group: selectedGroup || groups[0] || "",
    ...columns.reduce((acc, col) => {
      acc[col.key] = col.type === "checkbox" ? false : "";
      return acc;
    }, {}),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const finalValue = type === "checkbox" ? checked : value;
      const next = {
        ...prev,
        [name]: finalValue,
      };

      if (name === "bu") {
        if (prev.ligne && !getLinesByClient(finalValue).includes(prev.ligne)) {
          next.ligne = "";
        }
        if (prev.equipe) {
          next.equipe = "";
        }
      }

      if (name === "ligne" && prev.equipe) {
        next.equipe = "";
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);
    setError("");

    try {
      const payload = Object.fromEntries(
        Object.entries(formData)
          .filter(([, value]) => value !== "" && value !== null)
          .map(([key, value]) => {
            if (["nombre", "quantite_controlee", "semaine", "mat_csl2"].includes(key) && value !== "") {
              return [key, Number(value)];
            }
            return [key, value];
          })
      );

      await api.post(postEndpoint, payload);
      if (onSaved) await onSaved();
      setFormData({
        monday_group: selectedGroup || groups[0] || "",
        ...columns.reduce((acc, col) => {
          acc[col.key] = col.type === "checkbox" ? false : "";
          return acc;
        }, {}),
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Impossible d'enregistrer l'élément.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "24px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto",
      }}>
        <h2 style={{ marginBottom: "16px" }}>{title}</h2>

        {error && (
          <div style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {columns.map((col) => {
            if (col.key === "monday_group") return null;

            return (
              <div key={col.key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: 600 }}>
                  {col.label}
                  {col.required && " *"}
                </label>

                {col.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    name={col.key}
                    checked={formData[col.key]}
                    onChange={handleChange}
                  />
                ) : col.filterType === "select" && col.options ? (
                  <select
                    name={col.key}
                    value={formData[col.key]}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {((col.key === "ligne" && formData.bu)
                      ? getLinesByClient(formData.bu)
                      : col.key === "equipe" && formData.ligne
                      ? getSupervisorsByLine(formData.ligne)
                      : typeof col.options === "function"
                      ? col.options(formData)
                      : col.options
                    )?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={col.type || "text"}
                    name={col.key}
                    value={formData[col.key]}
                    onChange={handleChange}
                    placeholder={col.label}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                )}
              </div>
            );
          })}

          <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? "Enregistrement..." : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#e0e0e0",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
