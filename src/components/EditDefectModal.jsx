import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { api } from "../api";
import {
  clientOptions,
  getLinesByClient,
  getSupervisorsByLine,
  normalizeSuperviseurValue,
} from "../constants/lineConfig";

export default function EditDefectModal({ defect, onClose, onSuccess }) {
  const [form, setForm] = useState(defect || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [staticOptions, setStaticOptions] = useState({
    poste: [],
  });
  const [csl1, setCsl1] = useState([]);
  const [cf, setCf] = useState([]);

  const ligneOptions = useMemo(() => {
    if (!form.bu) {
      return [];
    }
    return getLinesByClient(form.bu);
  }, [form.bu]);

  const superviseurOptions = useMemo(() => {
    return getSupervisorsByLine(form.ligne);
  }, [form.ligne]);

  useEffect(() => {
    async function loadLookups() {
      try {
        const [staticRes, csl1Res, cfRes] = await Promise.all([
          api.get("/lookups/static"),
          api.get("/lookups/csl1"),
          api.get("/lookups/cf"),
        ]);
        setStaticOptions(staticRes.data || {});
        setCsl1(csl1Res.data || []);
        setCf(cfRes.data || []);
      } catch (err) {
        console.error("Error loading lookups:", err);
      }
    }
    loadLookups();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setForm((prev) => {
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
  }

  function handleCSL1Change(e) {
    const matricule = e.target.value;
    const selected = csl1.find((x) => x.value === matricule);

    setForm((prev) => ({
      ...prev,
      mat_csl1: matricule,
      prenom_nom_csl1: selected?.full_name || "",
    }));
  }

  function handleCFChange(e) {
    const matricule = e.target.value;
    const selected = cf.find((x) => x.value === matricule);

    setForm((prev) => ({
      ...prev,
      mat_cf: matricule,
      prenom_nom_cf: selected?.full_name || "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      date_detection: form.date_detection || null,
      bu: form.bu || null,
      ligne: form.ligne || null,
      poste: form.poste || null,
      equipe: form.equipe || null,
      defaut: form.defaut || null,
      nombre: form.nombre ? Number(form.nombre) : null,
      mat_csl1: form.mat_csl1 || null,
      prenom_nom_csl1: form.prenom_nom_csl1 || null,
      mat_cf: form.mat_cf || null,
      prenom_nom_cf: form.prenom_nom_cf || null,
      quantite_controlee: form.quantite_controlee
        ? Number(form.quantite_controlee)
        : null,
    };

    try {
      await api.patch(`/defects/${defect.id}`, payload);
      setLoading(false);
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Error updating defect:", err);
      setError(err.response?.data?.detail || "Erreur lors de la mise à jour");
      setLoading(false);
    }
  }

  const postOptions = staticOptions.poste || ["CSL1", "CF", "Test électrique"];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 24,
          maxWidth: 600,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0 }}>Modifier le défaut #{defect.id}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c33",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Date</span>
            <input
              type="date"
              name="date_detection"
              value={form.date_detection || ""}
              onChange={handleChange}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Client</span>
            <select
              name="bu"
              value={form.bu || ""}
              onChange={handleChange}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="">Choisir client</option>
              {clientOptions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Ligne</span>
            <select
              name="ligne"
              value={form.ligne || ""}
              onChange={handleChange}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="">Choisir ligne</option>
              {ligneOptions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Poste</span>
            <select
              name="poste"
              value={form.poste || ""}
              onChange={handleChange}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="">Choisir poste</option>
              {postOptions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Superviseur</span>
            <select
              name="equipe"
              value={form.equipe || ""}
              onChange={handleChange}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="">Choisir superviseur</option>
              {superviseurOptions.map((x) => (
                <option key={x} value={x}>
                  {normalizeSuperviseurValue(x)}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Défaut</span>
            <input
              type="text"
              name="defaut"
              value={form.defaut || ""}
              onChange={handleChange}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Nombre</span>
            <input
              type="number"
              name="nombre"
              value={form.nombre || 0}
              onChange={handleChange}
              min="0"
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Mat CSL1</span>
            <select
              name="mat_csl1"
              value={form.mat_csl1 || ""}
              onChange={handleCSL1Change}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="">Choisir Mat CSL1</option>
              {csl1.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Prénom Nom CSL1</span>
            <input
              type="text"
              name="prenom_nom_csl1"
              value={form.prenom_nom_csl1 || ""}
              readOnly
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                backgroundColor: "#f9f9f9",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Mat CF</span>
            <select
              name="mat_cf"
              value={form.mat_cf || ""}
              onChange={handleCFChange}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="">Choisir Mat CF</option>
              {cf.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Prénom Nom CF</span>
            <input
              type="text"
              name="prenom_nom_cf"
              value={form.prenom_nom_cf || ""}
              readOnly
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                backgroundColor: "#f9f9f9",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Quantité contrôlée</span>
            <input
              type="number"
              name="quantite_controlee"
              value={form.quantite_controlee || ""}
              onChange={handleChange}
              min="0"
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </label>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              marginTop: 24,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "10px 24px",
                border: "1px solid #ddd",
                borderRadius: 6,
                backgroundColor: "white",
                color: "#172033",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14,
                opacity: loading ? 0.6 : 1,
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 24px",
                border: "none",
                borderRadius: 6,
                backgroundColor: "#2563eb",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
