import { Filter, X } from "lucide-react";
import ColorBadge, { getBadgeColor } from "./ColorBadge";

export default function TableFilter({ columns, filters = {}, onFilterChange, onClearFilters }) {
  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value !== "" && value !== null && value !== undefined
  );

  const filteredColumns = columns.filter((col) => col.filterType);

  const handleFilterChange = (columnKey, value) => {
    onFilterChange?.({
      ...filters,
      [columnKey]: value,
    });
  };

  const clearFilters = () => {
    onClearFilters?.();
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-top">
        <div className="filter-panel-title">
          <Filter size={18} />
          <div>
            <strong>Filtres</strong>
            <div className="filter-panel-subtitle">
              {activeFilters.length > 0
                ? `${activeFilters.length} filtre(s) actif(s)`
                : "Aucun filtre appliqué"}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="filter-clear-button"
          onClick={clearFilters}
          disabled={activeFilters.length === 0}
        >
          <X size={14} />
          Réinitialiser les filtres
        </button>
      </div>

      <div className="filter-controls">
        {filteredColumns.map((col) => {
          const value = filters?.[col.key] ?? "";
          const placeholder =
            col.filterType === "select"
              ? "Tous"
              : col.filterType === "date"
              ? "Sélectionner une date"
              : `Recherche ${col.label}`;

          return (
            <div className="filter-control" key={col.key}>
              <label htmlFor={`filter-${col.key}`}>{col.label}</label>
              {col.filterType === "select" ? (
                <select
                  id={`filter-${col.key}`}
                  value={value}
                  onChange={(e) => handleFilterChange(col.key, e.target.value)}
                >
                  <option value="">Tous</option>
                  {(typeof col.options === "function" ? col.options(filters) : col.options)?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`filter-${col.key}`}
                  type={
                    col.filterType === "date"
                      ? "date"
                      : col.filterType === "number"
                      ? "number"
                      : "text"
                  }
                  value={value}
                  onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  placeholder={placeholder}
                />
              )}
            </div>
          );
        })}
      </div>

      {activeFilters.length > 0 && (
        <div className="filter-badges">
          {activeFilters.map(([key, value]) => {
            const column = columns.find((col) => col.key === key);
            const badgeColor = getBadgeColor(key, value);
            const isValueBadge = ["ligne", "bu", "poste", "equipe"].includes(key);
            return (
              <span className="filter-pill" key={key}>
                <strong>{column?.label || key}:</strong>
                {isValueBadge ? (
                  <ColorBadge columnKey={key} value={value} color={badgeColor} className="filter-pill-badge" />
                ) : (
                  value
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
