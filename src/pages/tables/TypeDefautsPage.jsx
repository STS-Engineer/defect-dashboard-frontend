import { useEffect, useState } from "react";
import { api, deleteResource } from "../../api";
import GroupedTable from "../../components/GroupedTable";
import AddElementForm from "../../components/AddElementForm";
import { useAuth } from "../../context/AuthContext";

const columns = [
  { key: "name", label: "Type de défaut", filterType: "text", required: true },
];

export default function TypeDefautsPage() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");

  const canAddEdit = currentUser?.role === "Data Entry";
  const canDelete = currentUser?.username === "lassaad.charaabi";

  async function loadRows() {
    const res = await api.get("/dashboards/defect-types");
    setRows(res.data);
  }

  async function handleDelete(row) {
    try {
      await deleteResource("/dashboards/defect-types", row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
    } catch (err) {
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
    loadRows();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1>Type de défauts</h1>
        <button onClick={loadRows} style={{ marginTop: "8px" }}>
          Actualiser
        </button>
      </div>

      <GroupedTable
        title="Types de défauts"
        keyField="id"
        columns={columns}
        rows={rows}
        groupKey="monday_group"
        onEdit={canAddEdit ? handleEdit : null}
        onDelete={canDelete ? handleDelete : null}
        onAddElement={canAddEdit ? handleAddElement : null}
        onAddGroup={async (groupName) => {
          // Group creation happens when first element is added to it
          // This callback is for future group management
        }}
      />

      {canAddEdit && showAddForm && (
        <AddElementForm
          title="Ajouter un type de défaut"
          columns={columns}
          groups={uniqueGroups.length > 0 ? uniqueGroups : ["groupe 1-6"]}
          selectedGroup={selectedGroup}
          postEndpoint="/dashboards/defect-types"
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
