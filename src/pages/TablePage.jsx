import { useCallback, useEffect, useState } from "react";
import { api, deleteResource } from "../api";
import GroupedTable from "../components/GroupedTable";
import SimpleTable from "../components/SimpleTable";
import {
  allClientLines,
  clientOptions,
  getLinesByClient,
  getSupervisorOptions,
} from "../constants/lineConfig";

export default function TablePage() {
  const [defects, setDefects] = useState([]);
  const [workersCf, setWorkersCf] = useState([]);
  const [workersCsl1, setWorkersCsl1] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [quantite, setQuantite] = useState([]);
  const [copieDetection, setCopieDetection] = useState([]);

  const loadAll = useCallback(async () => {
    const [defectsRes, cfRes, csl1Res, typesRes, quantiteRes, copieRes] = await Promise.all([
      api.get("/defects"),
      api.get("/dashboards/workers-cf"),
      api.get("/dashboards/workers-csl1"),
      api.get("/dashboards/defect-types"),
      api.get("/dashboards/quantite"),
      api.get("/dashboards/copie-detection"),
    ]);
    setDefects(defectsRes.data);
    setWorkersCf(cfRes.data);
    setWorkersCsl1(csl1Res.data);
    setDefectTypes(typesRes.data);
    setQuantite(quantiteRes.data);
    setCopieDetection(copieRes.data);
  }, []);

  async function handleDelete(resourcePath, id, setter) {
    try {
      await deleteResource(resourcePath, id);
      setter((current) => current.filter((row) => row.id !== id));
    } catch {
      window.alert("Impossible de supprimer la ligne. Veuillez réessayer.");
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAll();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAll]);

  return (
    <div className="page-content">
      <div className="page-header-toolbar">
        <div>
          <h1>Tables de données</h1>
          <p className="help-text">Consultez et filtrez vos tableaux métier depuis un seul écran.</p>
        </div>
        <button className="secondary" type="button" onClick={loadAll}>
          Actualiser
        </button>
      </div>

      <GroupedTable
        title="Détection de défauts"
        keyField="id"
        columns={[
          { key: "date_detection", label: "Date", filterType: "date" },
          { key: "semaine", label: "Semaine", filterType: "number" },
          {
            key: "bu",
            label: "Client",
            filterType: "select",
            options: clientOptions,
          },
          {
            key: "ligne",
            label: "Ligne",
            filterType: "select",
            options: (filters) => (filters.bu ? getLinesByClient(filters.bu) : allClientLines),
          },
          {
            key: "poste",
            label: "Poste",
            filterType: "select",
            options: ["CSL1", "CF", "Test électrique"],
          },
          {
            key: "equipe",
            label: "Superviseur",
            filterType: "select",
            options: getSupervisorOptions,
          },
          { key: "defaut", label: "Défaut", filterType: "text" },
          { key: "nombre", label: "Nombre", filterType: "number" },
          { key: "mat_csl1", label: "Mat CSL1", filterType: "text" },
          { key: "prenom_nom_csl1", label: "Nom CSL1", filterType: "text" },
          { key: "mat_cf", label: "Mat CF", filterType: "text" },
          { key: "prenom_nom_cf", label: "Nom CF", filterType: "text" },
          { key: "quantite_controlee", label: "Quantité contrôlée", filterType: "number" },
        ]}
        rows={defects}
        onDelete={(row) => handleDelete("/defects", row.id, setDefects)}
      />

      <SimpleTable
        title="CF (Contrôleurs finaux)"
        keyField="id"
        columns={[
          { key: "matricule", label: "Matricule", filterType: "text" },
          { key: "full_name", label: "Nom complet", filterType: "text" },
        ]}
        rows={workersCf}
        onDelete={(row) => handleDelete("/dashboards/workers-cf", row.id, setWorkersCf)}
      />

      <SimpleTable
        title="CSL 1"
        keyField="id"
        columns={[
          { key: "matricule", label: "Matricule", filterType: "text" },
          { key: "full_name", label: "Nom complet", filterType: "text" },
        ]}
        rows={workersCsl1}
        onDelete={(row) => handleDelete("/dashboards/workers-csl1", row.id, setWorkersCsl1)}
      />

      <SimpleTable
        title="Types de défauts"
        keyField="id"
        columns={[
          { key: "name", label: "Type de défaut", filterType: "text" },
        ]}
        rows={defectTypes}
        onDelete={(row) => handleDelete("/dashboards/defect-types", row.id, setDefectTypes)}
      />

      <SimpleTable
        title="Quantité"
        keyField="id"
        columns={[
          { key: "date", label: "Date", filterType: "date" },
          { key: "semaine", label: "Semaine", filterType: "number" },
          { 
            key: "ligne", 
            label: "Ligne",
            filterType: "select",
            options: (filters) => (filters.bu ? getLinesByClient(filters.bu) : allClientLines)
          },
          { 
            key: "bu", 
            label: "Client",
            filterType: "select",
            options: clientOptions
          },
          { 
            key: "equipe", 
            label: "Superviseur",
            filterType: "select",
            options: getSupervisorOptions
          },
          { key: "quantite_controlee", label: "Quantité contrôlée", filterType: "number" },
          { key: "prenom_nom_csl1", label: "Nom CSL1", filterType: "text" },
          { key: "prenom_nom_cf", label: "Nom CF", filterType: "text" },
          { key: "mat_csl2", label: "Mat CSL2", filterType: "text" },
        ]}
        rows={quantite}
        onDelete={(row) => handleDelete("/dashboards/quantite", row.id, setQuantite)}
      />

      <SimpleTable
        title="Copie de détection de défauts"
        keyField="id"
        columns={[
          { key: "date", label: "Date", filterType: "date" },
          { key: "semaine", label: "Semaine", filterType: "number" },
          { 
            key: "ligne", 
            label: "Ligne",
            filterType: "select",
            options: (filters) => (filters.bu ? getLinesByClient(filters.bu) : allClientLines)
          },
          { 
            key: "bu", 
            label: "Client",
            filterType: "select",
            options: clientOptions
          },
          { 
            key: "poste", 
            label: "Poste",
            filterType: "select",
            options: ["CSL1", "CF", "Test électrique"]
          },
          { 
            key: "equipe", 
            label: "Superviseur",
            filterType: "select",
            options: getSupervisorOptions
          },
          { key: "nombre", label: "Nombre", filterType: "number" },
          { key: "mat_cf", label: "Mat CF", filterType: "text" },
        ]}
        rows={copieDetection}
        onDelete={(row) => handleDelete("/dashboards/copie-detection", row.id, setCopieDetection)}
      />
    </div>
  );
}
