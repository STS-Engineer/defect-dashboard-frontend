import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import TableFilter from "./TableFilter";
import { matchesFilterValue } from "./filterUtils";
import ColorBadge from "./ColorBadge";

// Dynamic color palette - cycle through for group assignment
const COLOR_PALETTE = [
  "#1976D2", // Blue
  "#7B1FA2", // Purple
  "#F57C00", // Orange
  "#388E3C", // Green
  "#757575", // Gray
  "#00838F", // Cyan
  "#C2185B", // Pink
  "#0097A7", // Teal
];

function countLabel(count) {
  return `${count} ${count === 1 ? "élément" : "éléments"}`;
}

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

export default function GroupedTable({ 
  title, 
  columns, 
  rows, 
  keyField, 
  groupKey = "monday_group", 
  onDelete,
  onEdit,
  onAddElement,
  filters: controlledFilters,
  onFilterChange,
  onClearFilters,
  showFilters = true,
  fallbackGroupName = null,
}) {
  const [internalFilters, setInternalFilters] = useState({});
  const filters = controlledFilters ?? internalFilters;
  const setFilters = onFilterChange ?? setInternalFilters;
  const [collapsedGroups, setCollapsedGroups] = useState({});

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

  // Group rows and compute a representative date for each group (earliest element date)
  const { groupedRows, orderedGroupNames, groupColors } = useMemo(() => {
    const groups = {};
    const groupsWithDates = {};

    const toDate = (row) => {
      const d = row?.date_detection || row?.date || row?.date_created || null;
      if (!d) return new Date();
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    filteredRows.forEach((row) => {
      const groupName = row[groupKey] || fallbackGroupName;
      if (!groupName) return; // skip rows without group

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(row);

      const rowDate = toDate(row);
      if (!groupsWithDates[groupName]) {
        groupsWithDates[groupName] = rowDate;
      } else {
        // keep earliest date for the group
        if (rowDate < groupsWithDates[groupName]) {
          groupsWithDates[groupName] = rowDate;
        }
      }
    });

    // Order groups by their earliest date descending (newest first)
    const ordered = Object.keys(groups).sort((a, b) => {
      const da = groupsWithDates[a] || new Date();
      const db = groupsWithDates[b] || new Date();
      return db.getTime() - da.getTime();
    });

    // Assign colors based on ordered index
    const colors = {};
    ordered.forEach((group, idx) => {
      colors[group] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
    });

    return { groupedRows: groups, orderedGroupNames: ordered, groupColors: colors };
  }, [filteredRows, groupKey, fallbackGroupName]);

  const toggleGroup = (groupName) => {
    setCollapsedGroups((current) => ({
      ...current,
      [groupName]: !current[groupName],
    }));
  };

  const handleAddElement = (groupName) => {
    if (onAddElement) {
      onAddElement(groupName);
    }
  };

  return (
    <div className="table-card" style={{ marginBottom: 40 }}>
      <div className="table-toolbar">
        <div>
          <h2>{title}</h2>
          <p className="help-text">
            {filteredRows.length} affichés sur {rows.length}
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

      {orderedGroupNames.length === 0 ? (
        <div className="empty-state">Aucune ligne à afficher.</div>
      ) : (
        <>
          {orderedGroupNames.map((groupName) => {
            const group = groupedRows[groupName] || [];
            const isCollapsed = collapsedGroups[groupName] ?? false;
            const color = groupColors[groupName];

            return (
              <div className="group-card" key={groupName}>
                <div className="group-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#f5f5f5", borderBottom: "1px solid #e0e0e0", cursor: "pointer" }}>
                  <button 
                    type="button" 
                    onClick={() => toggleGroup(groupName)}
                    style={{ 
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left"
                    }}
                  >
                    <span className="group-card-badge" style={{ backgroundColor: color, width: 12, height: 12, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                    <div>
                      <div className="group-card-title" style={{ fontWeight: 600, marginBottom: 4 }}>{groupName}</div>
                      <div className="group-card-subtitle" style={{ fontSize: "0.85em", color: "#666" }}>{countLabel(group.length)}</div>
                    </div>
                    <span className="group-card-icon" style={{ marginLeft: "auto" }}>{isCollapsed ? "▶" : "▼"}</span>
                  </button>
                  {!isCollapsed && onAddElement && (
                    <button 
                      className="add-button" 
                      type="button" 
                      onClick={() => handleAddElement(groupName)}
                      style={{ marginLeft: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Plus size={16} />
                      Ajouter
                    </button>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="group-card-table">
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
                          {group.map((row) => (
                            <tr key={row[keyField]}>
                              {columns.map((col) => (
                                <td key={col.key}>{renderCell(col, row)}</td>
                              ))}
                              {(onEdit || onDelete) && (
                                <td style={{ display: "flex", gap: "8px" }}>
                                  {onEdit && (
                                    <button className="edit-button" type="button" onClick={() => onEdit(row)}>
                                      Modifier
                                    </button>
                                  )}
                                  {onDelete && (
                                    <button className="delete-button" type="button" onClick={() => {
                                      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce défaut?\nCette action est irréversible.")) {
                                        onDelete(row);
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
                )}
              </div>
            );
          })}

          {/* removed standalone add-group UI: groups are created when first element is added via the form */}
        </>
      )}
    </div>
  );
}
