import { X } from "lucide-react";
import FilterPanel from "./FilterPanel";

const LABELS = {
  defaut: "Défaut",
  date: "Date",
  ligne: "Ligne",
  operateur: "Opérateur",
  poste: "Poste",
  bu: "Client",
  equipe: "Superviseur",
  semaine: "Semaine",
  mois: "Mois",
};

function getActiveCount(filters) {
  let count = 0;

  Object.entries(filters).forEach(([key, value]) => {
    if (key === "dateFrom" || key === "dateTo") return;
    if (Array.isArray(value)) count += value.length;
  });

  if (filters.dateFrom) count += 1;
  if (filters.dateTo) count += 1;

  return count;
}

function formatFilterValue(values) {
  if (!values) return "";
  return Array.isArray(values) ? values.join(", ") : String(values);
}

export default function ChartFilter({
  filters,
  onFilterChange,
  onClearFilters,
  options = {},
  fields = ["defaut", "date", "ligne", "operateur"],
}) {
  const activeFilterCount = getActiveCount(filters);

  const handleMultiSelect = (filterKey, event) => {
    const selected = Array.from(event.target.selectedOptions, (option) => option.value).filter(Boolean);
    onFilterChange?.({
      ...filters,
      [filterKey]: selected,
    });
  };

  const handleDateChange = (filterKey, value) => {
    onFilterChange?.({
      ...filters,
      [filterKey]: value,
    });
  };

  const renderFilterItem = (field) => {
    if (field === "date") {
      return (
        <div className="chart-filter-item chart-filter-date-range" key={field}>
          <div>
            <label htmlFor="filter-date-from">Du</label>
            <input
              id="filter-date-from"
              type="date"
              value={filters.dateFrom || ""}
              onChange={(event) => handleDateChange("dateFrom", event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="filter-date-to">Au</label>
            <input
              id="filter-date-to"
              type="date"
              value={filters.dateTo || ""}
              onChange={(event) => handleDateChange("dateTo", event.target.value)}
            />
          </div>
        </div>
      );
    }

    const values = typeof options[field] === "function" ? options[field](filters) : options[field] || [];
    if (values.length === 0) return null;

    const label = LABELS[field] || field.charAt(0).toUpperCase() + field.slice(1);
    const value = filters[field] || [];

    return (
      <div className="chart-filter-item" key={field}>
        <label htmlFor={`filter-${field}`}>{label}</label>
        <select
          id={`filter-${field}`}
          multiple
          size={Math.min(values.length || 4, 6)}
          value={value}
          onChange={(event) => handleMultiSelect(field, event)}
        >
          {values.map((optionValue) => (
            <option key={optionValue} value={optionValue}>
              {optionValue}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <FilterPanel title="Filtres" activeCount={activeFilterCount}>
      <div className="chart-filter-controls">
        {fields.map(renderFilterItem)}
      </div>

      {activeFilterCount > 0 && (
        <div className="chart-filter-pills">
          {Object.entries(filters).map(([key, value]) => {
            if (key === "dateFrom" || key === "dateTo") return null;
            if (!Array.isArray(value) || value.length === 0) return null;
            const label = LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <span key={key} className="chart-filter-pill">
                {label}: {formatFilterValue(value)}
              </span>
            );
          })}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="chart-filter-pill">
              {LABELS.date}: {filters.dateFrom || "—"} au {filters.dateTo || "—"}
            </span>
          )}
        </div>
      )}

      <div className="chart-filter-actions">
        <button
          type="button"
          className="chart-filter-clear"
          onClick={onClearFilters}
          disabled={activeFilterCount === 0}
        >
          <X size={14} />
          Réinitialiser
        </button>
      </div>
    </FilterPanel>
  );
}
