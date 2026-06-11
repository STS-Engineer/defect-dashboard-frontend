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
  { key: "nombre", label: "Nombre", type: "number" },
  { key: "mat_cf", label: "Mat CF", filterType: "text" },
];

export default function CopieDetectionPage() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");

  const canAddEdit = currentUser?.role === "Data Entry";
  const canDelete = currentUser?.username === "lassaad.charaabi";

  const loadRows = useCallback(async () => {
    const res = await api.get("/dashboards/copie-detection");
    setRows(res.data);
  }, []);

  async function handleDelete(row) {
    try {
      await deleteResource("/dashboards/copie-detection", row.id);
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
        <h1>Copie de détection de défauts</h1>
        <button onClick={loadRows} style={{ marginTop: "8px" }}>
          Actualiser
        </button>
      </div>

      <GroupedTable
        title="Copie de détection de défauts"
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
          title="Ajouter un élément de copie détection"
          columns={columns}
          groups={uniqueGroups.length > 0 ? uniqueGroups : ["Semaine"]}
          selectedGroup={selectedGroup}
          postEndpoint="/dashboards/copie-detection"
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
