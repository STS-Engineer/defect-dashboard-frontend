import { useState } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";

export default function FilterPanel({ title = "Filtres", activeCount = 0, children }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="filter-panel">
      <button
        type="button"
        className={`filter-panel-toggle ${showFilters ? "open" : ""}`}
        onClick={() => setShowFilters((current) => !current)}
      >
        <span className="filter-panel-toggle-left">
          <Filter size={16} />
          <span>{title}</span>
        </span>
        {activeCount > 0 && <span className="filter-panel-count">{activeCount}</span>}

        {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div className={`filter-panel-body ${showFilters ? "open" : ""}`}>
        {children}
      </div>
    </div>
  );
}
