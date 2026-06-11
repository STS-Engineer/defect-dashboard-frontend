import { useMemo, useState } from "react";
import TableFilter from "./TableFilter";
import ColorBadge from "./ColorBadge";
import { matchesFilterValue } from "./filterUtils";

function renderCell(col, row) {
  if (col.render) {
    return col.render(row);
  }

  const value = row[col.key];
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  if (["ligne", "bu", "poste", "equipe"].includes(col.key)) {
    return <ColorBadge columnKey={col.key} value={value} />;
  }

  return value;
}

export default function SimpleTable({
  title,
  columns,
  rows,
  keyField,
  onDelete,
  onEdit,
  filters: controlledFilters,
  onFilterChange,
  onClearFilters,
  showFilters = true,
}) {
  const [internalFilters, setInternalFilters] = useState({});
  const filters = controlledFilters ?? internalFilters;
  const setFilters = onFilterChange ?? setInternalFilters;

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return Object.entries(filters).every(([columnKey, filterValue]) => {
        if (filterValue === "" || filterValue === null || filterValue === undefined) {
          return true;
        }

        const columnDef = columns.find((col) => col.key === columnKey);
        const cellValue = columnDef?.filterValue
          ? columnDef.filterValue(row)
          : row[columnKey];
        const filterType = columnDef?.filterType || "text";
        return matchesFilterValue(cellValue, filterValue, filterType, columnKey);
      });
    });
  }, [rows, filters, columns]);

  return (
    <div className="table-card" style={{ marginBottom: 40, width: "100%" }}>
      <div className="table-toolbar">
        <div>
          <h2>{title}</h2>
          <p className="help-text">
            Affichage de {filteredRows.length} sur {rows.length} éléments
          </p>
        </div>
      </div>

      {showFilters && (
        <TableFilter
          columns={columns}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={onClearFilters ?? (() => setFilters({}))}
        />
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r[keyField]}>
                {columns.map((col) => (
                  <td key={col.key}>{renderCell(col, r)}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={{ display: "flex", gap: "8px" }}>
                    {onEdit && (
                      <button className="edit-button" type="button" onClick={() => onEdit(r)}>
                        Modifier
                      </button>
                    )}
                    {onDelete && (
                      <button className="delete-button" type="button" onClick={() => {
                        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce défaut?\nCette action est irréversible.")) {
                          onDelete(r);
                        }
                      }}>
                        Supprimer
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
