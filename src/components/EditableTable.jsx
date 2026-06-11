import { useMemo, useState } from "react";
import { api } from "../api";
import { Plus } from "lucide-react";
import TableFilter from "./TableFilter";
import ColorBadge from "./ColorBadge";
import { matchesFilterValue } from "./filterUtils";

const numberFields = new Set(["nombre", "quantite_controlee", "semaine"]);

function buildEmptyRow(columns) {
  return columns.reduce((draft, col) => {
    draft[col.key] = "";
    return draft;
  }, {});
}

function normalizePayload(draft) {
  return Object.fromEntries(
    Object.entries(draft)
      .filter(([, value]) => value !== "")
      .map(([key, value]) => [
        key,
        numberFields.has(key) ? Number(value) : value,
      ])
  );
}

function renderCell(col, row) {
  const value = row[col.key];
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  if (["ligne", "bu", "poste", "equipe"].includes(col.key)) {
    return <ColorBadge columnKey={col.key} value={value} />;
  }

  return col.render ? col.render(row) : value;
}

export default function EditableTable({ title, columns, rows, keyField, postEndpoint, onSaved, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState(() => buildEmptyRow(columns));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return Object.entries(filters).every(([columnKey, filterValue]) => {
        if (filterValue === "" || filterValue === null || filterValue === undefined) {
          return true;
        }

        const columnDef = columns.find((col) => col.key === columnKey);
        const filterType = columnDef?.filterType || "text";
        return matchesFilterValue(row[columnKey], filterValue, filterType, columnKey);
      });
    });
  }, [rows, filters, columns]);

  function startAdd() {
    setDraft(buildEmptyRow(columns));
    setError("");
    setIsAdding(true);
  }

  function cancelAdd() {
    setDraft(buildEmptyRow(columns));
    setError("");
    setIsAdding(false);
  }

  function updateDraft(key, value) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveDraft() {
    setIsSaving(true);
    setError("");

    try {
      await api.post(postEndpoint, normalizePayload(draft));
      setIsAdding(false);
      setDraft(buildEmptyRow(columns));
      await onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Impossible d'enregistrer la ligne.");
    } finally {
      setIsSaving(false);
    }
  }

  function clearFilters() {
    setFilters({});
  }

  return (
    <div className="editable-table" style={{ marginBottom: 40 }}>
      <div className="table-toolbar">
        <div>
          <h2>{title}</h2>
          <p className="help-text">Affichage de {filteredRows.length} sur {rows.length} éléments</p>
        </div>
        <button className="add-button" type="button" onClick={startAdd}>
          <Plus size={16} style={{ marginRight: 4 }} />
          Ajouter élément
        </button>
      </div>

      <TableFilter
        columns={columns}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
      />

      <div className="table-wrap">
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {(isAdding || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr>
                {columns.map((col) => (
                  <td key={col.key}>
                    <input
                      type={col.type || "text"}
                      value={draft[col.key]}
                      onChange={(event) => updateDraft(col.key, event.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveDraft} disabled={isSaving}>
                      {isSaving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button className="secondary" onClick={cancelAdd} disabled={isSaving}>
                      Annuler
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr key={row[keyField]}>
                {columns.map((col) => (
                  <td key={col.key}>{renderCell(col, row)}</td>
                ))}
                {(isAdding || onDelete) && (
                  <td>
                    {onDelete ? (
                      <button className="delete-button" type="button" onClick={() => {
                        if (window.confirm("Voulez-vous vraiment supprimer cette ligne ?")) {
                          onDelete(row);
                        }
                      }}>
                        Supprimer
                      </button>
                    ) : null}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="help-text">{error}</p>}
    </div>
  );
}
