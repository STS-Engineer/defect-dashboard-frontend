import { useCallback, useEffect, useState } from "react";
import { api, deleteResource } from "../../api";
import GroupedTable from "../../components/GroupedTable";
import AddElementForm from "../../components/AddElementForm";
import { useAuth } from "../../context/AuthContext";
import {
  allClientLines,
  clientOptions,
  getLinesByClient,
  getSupervisorOptions,
} from "../../constants/lineConfig";

const columns = [
  { key: "item_name", label: "Element", filterType: "text", required: true },
  { key: "date", label: "Date", type: "date", filterType: "date" },
  { key: "semaine", label: "Semaine", type: "number", filterType: "number" },
  {
    key: "ligne",
    label: "Ligne",
    filterType: "select",
    options: (filters) => (filters.bu ? getLinesByClient(filters.bu) : allClientLines),
  },
  {
    key: "bu",
    label: "Client",
    filterType: "select",
    options: clientOptions,
  },
  {
    key: "equipe",
    label: "Superviseur",
    filterType: "select",
    options: getSupervisorOptions,
  },
  { key: "quantite_controlee", label: "Quantite controlee", type: "number" },
  { key: "mat_csl1", label: "Mat CSL1", filterType: "text" },
  { key: "prenom_nom_csl1", label: "Nom CSL1", filterType: "text" },
  { key: "mat_cf", label: "Mat CF", filterType: "text" },
  { key: "prenom_nom_cf", label: "Nom CF", filterType: "text" },
  { key: "mat_csl2", label: "Mat CSL2", filterType: "text" },
];

export default function QuantiteTablePage() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");

  const canAddEdit = currentUser?.role === "Data Entry";
  const canDelete = currentUser?.username === "lassaad.charaabi";

  const loadRows = useCallback(async () => {
    const res = await api.get("/dashboards/quantite");
    setRows(res.data);
  }, []);

  async function handleDelete(row) {
    try {
      await deleteResource("/dashboards/quantite", row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
    } catch {
      window.alert("Impossible de supprimer la ligne. Veuillez réessayer.");
    }
  }

  const handleEdit = (row) => {
    window.alert("Modification de la ligne " + row.id + " non disponible");
  };

  const handleAddElement = (groupName) => {
    setSelectedGroup(groupName);
    setShowAddForm(true);
  };

  const uniqueGroups = Array.from(
    new Set(rows.map((row) => row.monday_group).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRows]);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1>Quantité</h1>
        <button onClick={loadRows} style={{ marginTop: "8px" }}>
          Actualiser
        </button>
      </div>

      <GroupedTable
        title="Quantité"
        keyField="id"
        columns={columns}
        rows={rows}
        groupKey="monday_group"
        onEdit={canAddEdit ? handleEdit : null}
        onDelete={canDelete ? handleDelete : null}
        onAddElement={canAddEdit ? handleAddElement : null}
        onAddGroup={async () => {
          // Group creation happens when first element is added to it
          // This callback is for future group management
        }}
      />

      {canAddEdit && showAddForm && (
        <AddElementForm
          title="Ajouter un élément de quantité"
          columns={columns}
          groups={uniqueGroups.length > 0 ? uniqueGroups : ["Semaine"]}
          selectedGroup={selectedGroup}
          postEndpoint="/dashboards/quantite"
          onSaved={async () => {
            setShowAddForm(false);
            await loadRows();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
