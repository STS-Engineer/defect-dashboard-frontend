import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import {
  clientOptions,
  getLinesByClient,
  getSupervisorsByLine,
  normalizeSuperviseurValue,
} from "../constants/lineConfig";

const initialForm = {
  form_type: "",
  is_nidec: false,
  monday_group: "",
  defaut: "",
  date_detection: "",
  ligne: "",
  bu: "",
  poste: "",
  equipe: "",
  nombre: 1,
  mat_csl1: "",
  prenom_nom_csl1: "",
  mat_cf: "",
  prenom_nom_cf: "",
  quantite_controlee: "",
  saisie_quantite_totale: false,
};

export default function DefectForm({ config, onRefresh }) {
  const [form, setForm] = useState({
    ...initialForm,
    form_type: config.form_type,
    is_nidec: config.is_nidec,
    bu: config.is_nidec ? "NIDEC" : "",
  });

  const [staticOptions, setStaticOptions] = useState({
    bu: [],
    ligne: [],
    poste: [],
    equipe: [],
  });

  const [defauts, setDefauts] = useState([]);
  const [csl1, setCsl1] = useState([]);
  const [cf, setCf] = useState([]);
  const clientSelectOptions = useMemo(() => {
    return Array.from(new Set([...(staticOptions.bu || []), ...clientOptions]));
  }, [staticOptions.bu]);

  const ligneOptions = useMemo(() => {
    if (!form.bu) {
      return staticOptions.ligne;
    }

    const mappedLines = getLinesByClient(form.bu);
    return mappedLines.length ? mappedLines : staticOptions.ligne;
  }, [form.bu, staticOptions.ligne]);

  const superviseurOptions = useMemo(() => {
    return getSupervisorsByLine(form.ligne);
  }, [form.ligne]);

  useEffect(() => {
    async function loadLookups() {
      const [staticRes, defautsRes, csl1Res, cfRes] = await Promise.all([
        api.get("/lookups/static"),
        api.get("/lookups/defauts"),
        api.get("/lookups/csl1"),
        api.get("/lookups/cf"),
      ]);

      setStaticOptions(staticRes.data);
      setDefauts(defautsRes.data);
      setCsl1(csl1Res.data);
      setCf(cfRes.data);

    }

    loadLookups();
  }, []);

  function isRequired(field) {
    return config.required.includes(field);
  }

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

    const payload = {
      ...form,
      monday_group: form.monday_group || null,
      date_detection: form.date_detection || null,
      nombre: Number(form.nombre || 0),
      quantite_controlee: form.quantite_controlee
        ? Number(form.quantite_controlee)
        : null,
    };

    try {
      await api.post("/defects", payload);
      alert("Enregistré avec succès");
      setForm({
        ...initialForm,
        form_type: config.form_type,
        is_nidec: config.is_nidec,
        bu: config.is_nidec ? "NIDEC" : "",
      });
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
      console.error(error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: 12,
        maxWidth: 720,
        background: "white",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #ddd",
      }}
    >
      <h2>{config.title}</h2>

      {config.hasDate && (
        <label>
          Date {isRequired("date_detection") && "*"}
          <input
            type="date"
            name="date_detection"
            value={form.date_detection}
            onChange={handleChange}
            required={isRequired("date_detection")}
          />
        </label>
      )}

      <label>
        Client {isRequired("bu") && "*"}
        <select
          name="bu"
          value={form.bu}
          onChange={handleChange}
          required={isRequired("bu")}
        >
          <option value="">Choisir client</option>
          {clientSelectOptions.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </label>

      <label>
        Ligne {isRequired("ligne") && "*"}
        <select
          name="ligne"
          value={form.ligne}
          onChange={handleChange}
          required={isRequired("ligne")}
        >
          <option value="">Choisir ligne</option>
          {ligneOptions.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </label>

      {config.hasDefaut && (
        <label>
          Défauts {isRequired("defaut") && "*"}
          <select
            name="defaut"
            value={form.defaut}
            onChange={handleChange}
            required={isRequired("defaut")}
          >
            <option value="">Choisir défaut</option>
            {defauts.map((x) => (
              <option key={x.value} value={x.value}>{x.label}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        Poste {isRequired("poste") && "*"}
        <select
          name="poste"
          value={form.poste}
          onChange={handleChange}
          required={isRequired("poste")}
        >
          <option value="">Choisir poste</option>
          {staticOptions.poste.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </label>

      <label>
        Superviseur {isRequired("equipe") && "*"}
        <select
          name="equipe"
          value={form.equipe}
          onChange={handleChange}
          required={isRequired("equipe")}
        >
          <option value="">Choisir superviseur</option>
          {superviseurOptions.map((x) => (
            <option key={x} value={x}>{normalizeSuperviseurValue(x)}</option>
          ))}
        </select>
      </label>

      <label>
        Nombre {isRequired("nombre") && "*"}
        <input
          type="number"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required={isRequired("nombre")}
          min="0"
        />
      </label>

      <label>
        Mat CSL1 {isRequired("mat_csl1") && "*"}
        <select
          name="mat_csl1"
          value={form.mat_csl1}
          onChange={handleCSL1Change}
          required={isRequired("mat_csl1")}
        >
          <option value="">Select Mat CSL1</option>
          {csl1.map((x) => (
            <option key={x.value} value={x.value}>{x.label}</option>
          ))}
        </select>
      </label>

      <label>
        Prénom Nom CSL1
        <input
          type="text"
          name="prenom_nom_csl1"
          value={form.prenom_nom_csl1}
          readOnly
        />
      </label>

      {config.hasCF && (
        <>
          <label>
            Mat CF {isRequired("mat_cf") && "*"}
            <select
              name="mat_cf"
              value={form.mat_cf}
              onChange={handleCFChange}
              required={isRequired("mat_cf")}
            >
              <option value="">Select Mat CF</option>
              {cf.map((x) => (
                <option key={x.value} value={x.value}>{x.label}</option>
              ))}
            </select>
          </label>

          <label>
            Prénom Nom CF
            <input
              type="text"
              name="prenom_nom_cf"
              value={form.prenom_nom_cf}
              readOnly
            />
          </label>
        </>
      )}

      {config.hasQuantite && (
        <label>
          Quantité contrôlée {isRequired("quantite_controlee") && "*"}
          <input
            type="number"
            name="quantite_controlee"
            value={form.quantite_controlee}
            onChange={handleChange}
            required={isRequired("quantite_controlee")}
            min="0"
          />
        </label>
      )}

      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          name="saisie_quantite_totale"
          checked={form.saisie_quantite_totale}
          onChange={handleChange}
        />
        Saisie quantité totale
      </label>

      <small>
        Cochez la case si vous allez entrer la quantité en fin de shift.
      </small>

      <button type="submit">Enregistrer</button>
    </form>
  );
}
