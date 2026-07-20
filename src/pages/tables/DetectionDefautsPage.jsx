import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, deleteResource } from "../../api";
import { ChevronDown, Download, FileText, RefreshCw, X } from "lucide-react";
import * as XLSX from "xlsx";
import SimpleTable from "../../components/SimpleTable";
import TableFilter from "../../components/TableFilter";
import DefectForm from "../../components/DefectForm";
import EditDefectModal from "../../components/EditDefectModal";
import TreatmentStatusBadge from "../../components/TreatmentStatusBadge";
import { useAuth } from "../../context/AuthContext";
import { FORM_CONFIGS } from "../../forms/formConfigs";
import {
  allClientLines,
  clientOptions,
  getLinesByClient,
  getSupervisorOptions,
} from "../../constants/lineConfig";
import {
  buildTreatmentStatusOptions,
  getTreatmentStatusFilterValue,
  normalizeTreatmentStatus,
} from "../../utils/treatmentStatusUtils";
import { matchesFilterValue } from "../../components/filterUtils";

function isRecentDefect(row) {
  const normalizedStatus = normalizeTreatmentStatus(row);
  return normalizedStatus !== "HISTORIQUE";
}

function isHistoricalDefect(row) {
  const normalizedStatus = normalizeTreatmentStatus(row);
  return normalizedStatus === "HISTORIQUE";
}

function normalizeDefectRow(row) {
  const equipe = row.equipe || row.superviseur || "";
  const treatmentStatus = row.treatment_status || row.status || "";
  const normalizedStatus = normalizeTreatmentStatus({
    ...row,
    equipe,
    treatment_status: treatmentStatus,
  });

  return {
    ...row,
    equipe,
    superviseur: row.superviseur || equipe,
    treatment_status: treatmentStatus || normalizedStatus,
    treatment_status_display: normalizedStatus,
  };
}

export default function DetectionDefautsPage() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [isFormMenuOpen, setIsFormMenuOpen] = useState(false);
  const [selectedFormKey, setSelectedFormKey] = useState(null);
  const [editingDefect, setEditingDefect] = useState(null);
  const formMenuRef = useRef(null);

  const canAddEdit = currentUser?.role === "Data Entry";
  const canDelete = currentUser?.username === "lassaad.charaabi";
  const canExport = ["Consultant Qualite", "Responsable Qualite", "Data Entry"].includes(currentUser?.role);
  const formKeys = Object.keys(FORM_CONFIGS);
  const hasSecondCfInspector = useMemo(
    () => rows.some((row) => row.mat_cf_2 || row.prenom_nom_cf_2),
    [rows]
  );

  const handleEdit = useCallback((row) => {
    setEditingDefect(row);
  }, []);

  const statusOptions = useMemo(() => buildTreatmentStatusOptions(rows), [rows]);

  const columns = useMemo(() => [
    { key: "date_detection", label: "Date", type: "date", filterType: "date" },
    { key: "semaine", label: "Semaine", type: "number", filterType: "number" },
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
      options: (currentFilters) => (
        currentFilters.bu ? getLinesByClient(currentFilters.bu) : allClientLines
      ),
    },
    {
      key: "poste",
      label: "Poste",
      filterType: "select",
      options: ["CSL1", "CF", "Test \u00e9lectrique"],
    },
    {
      key: "equipe",
      label: "Superviseur",
      filterType: "select",
      options: getSupervisorOptions,
    },
    { 
      key: "defaut", 
      label: "D\u00e9faut", 
      filterType: "text",
      style: { minWidth: "140px", whiteSpace: "nowrap", padding: "12px 16px" }
    },
    {
      key: "treatment_status",
      label: "Statut du traitement",
      filterType: "select",
      options: statusOptions,
      filterValue: getTreatmentStatusFilterValue,
      render: (row) => (
        <TreatmentStatusBadge status={getTreatmentStatusFilterValue(row)} />
      ),
      style: { minWidth: "140px", whiteSpace: "nowrap", padding: "12px 16px", textAlign: "center" }
    },
    { key: "nombre", label: "Nombre", type: "number", filterType: "number" },
    { 
      key: "mat_csl1", 
      label: "Mat CSL1", 
      filterType: "text",
      style: { minWidth: "140px", whiteSpace: "nowrap", padding: "12px 16px" }
    },
    { 
      key: "prenom_nom_csl1", 
      label: "Nom CSL1", 
      filterType: "text",
      style: { minWidth: "140px", whiteSpace: "nowrap", padding: "12px 16px" }
    },
    { 
      key: "mat_cf", 
      label: "Mat CF", 
      filterType: "text",
      style: { minWidth: "140px", whiteSpace: "nowrap", padding: "12px 16px" }
    },
    { 
      key: "prenom_nom_cf", 
      label: "Nom CF", 
      filterType: "text",
      style: { minWidth: "140px", whiteSpace: "nowrap", padding: "12px 16px" }
    },
    ...(hasSecondCfInspector ? [
      { 
        key: "mat_cf_2", 
        label: "Mat CF 2", 
        filterType: "text",
        style: { minWidth: "140px", whiteSpace: "nowrap", padding: "12px 16px" }
      },
      { 
        key: "prenom_nom_cf_2", 
        label: "Nom CF 2", 
        filterType: "text",
        style: { minWidth: "140px", whiteSpace: "nowrap", padding: "12px 16px" }
      },
    ] : []),
    { key: "quantite_controlee", label: "Quantite controlee", type: "number", filterType: "number" },
  ], [hasSecondCfInspector, statusOptions]);

  const { recentRows, historicalRows } = useMemo(() => {
    return rows.reduce(
      (sections, row) => {
        if (isRecentDefect(row)) {
          sections.recentRows.push(row);
        } else if (isHistoricalDefect(row)) {
          sections.historicalRows.push(row);
        }
        return sections;
      },
      { recentRows: [], historicalRows: [] }
    );
  }, [rows]);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const loadRows = useCallback(async () => {
    const res = await api.get("/defects");
    setRows((res.data || []).map(normalizeDefectRow));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRows]);

  useEffect(() => {
    console.log('Detection Defauts page loaded');
    console.log('Total rows:', rows.length);
    console.log('Recent count:', recentRows.length);
    console.log('Historical count:', historicalRows.length);
  }, [rows, recentRows, historicalRows]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (formMenuRef.current && !formMenuRef.current.contains(event.target)) {
        setIsFormMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  async function handleDelete(row) {
    try {
      await deleteResource("/defects", row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
    } catch {
      window.alert("Impossible de supprimer la ligne. Veuillez r\u00e9essayer.");
    }
  }

  function handleExportExcel() {
    const exportColumns = [
      { key: "date_detection", label: "Date" },
      { key: "semaine", label: "Semaine" },
      { key: "bu", label: "Client" },
      { key: "ligne", label: "Ligne" },
      { key: "poste", label: "Poste" },
      { key: "equipe", label: "Superviseur" },
      { key: "defaut", label: "Défaut" },
      { key: "treatment_status_display", label: "Statut du traitement" },
      { key: "nombre", label: "Nombre" },
      { key: "mat_csl1", label: "Mat CSL1" },
      { key: "prenom_nom_csl1", label: "Nom CSL1" },
      { key: "mat_cf", label: "Mat CF" },
      { key: "prenom_nom_cf", label: "Nom CF" },
      ...(hasSecondCfInspector ? [
        { key: "mat_cf_2", label: "Mat CF 2" },
        { key: "prenom_nom_cf_2", label: "Nom CF 2" },
      ] : []),
      { key: "quantite_controlee", label: "Quantite controlee" },
    ];

    // Apply the same filter logic as SimpleTable to get the currently displayed rows
    const filteredRows = recentRows.filter((row) => {
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

    const data = filteredRows.map((row) => {
      const entry = {};
      exportColumns.forEach((col) => {
        let value = row[col.key];
        if (value === undefined || value === null || value === "") {
          value = "-";
        }
        entry[col.label] = value;
      });
      return entry;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Détection Défauts");

    // Auto-size column widths
    const colWidths = exportColumns.map((col) => {
      const maxLen = data.reduce((max, row) => {
        const val = String(row[col.label] || "");
        return Math.max(max, val.length);
      }, col.label.length);
      return { wch: Math.min(maxLen + 2, 40) };
    });
    ws["!cols"] = colWidths;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    XLSX.writeFile(wb, `Detection_Defauts_${dateStr}.xlsx`);
  }

  const handleFormSelect = (formKey) => {
    setSelectedFormKey(formKey);
    setIsFormMenuOpen(false);
  };

  const closeForm = () => {
    setSelectedFormKey(null);
  };

  return (
    <div className="page-content">
      <div className="page-header-toolbar">
        <div>
          <h1>Détection de défauts</h1>
          <p className="help-text">
            Filtrez, triez et accédez rapidement aux formulaires de détection.
          </p>
        </div>

        <div className="page-action-group">
          {canExport && (
            <button className="secondary" type="button" onClick={handleExportExcel}>
              <Download size={16} style={{ marginRight: 8 }} />
              Exporter Excel
            </button>
          )}

          <button className="secondary" type="button" onClick={loadRows}>
            <RefreshCw size={16} style={{ marginRight: 8 }} />
            Actualiser
          </button>

          {canAddEdit && (
            <div className="form-dropdown" ref={formMenuRef}>
              <button
                type="button"
                className="secondary form-dropdown-toggle"
                onClick={() => setIsFormMenuOpen((current) => !current)}
              >
                <FileText size={16} style={{ marginRight: 8 }} />
                Formulaires
                <ChevronDown size={16} style={{ marginLeft: 8 }} />
              </button>

              {isFormMenuOpen && (
                <div className="form-dropdown-menu">
                  {formKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className="form-dropdown-item"
                      onClick={() => handleFormSelect(key)}
                    >
                      {FORM_CONFIGS[key].title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {canAddEdit && selectedFormKey && (
        <div className="form-section">
          <div className="form-section-header">
            <h2>{FORM_CONFIGS[selectedFormKey].title}</h2>
            <button
              type="button"
              className="form-close-button"
              onClick={closeForm}
              title="Fermer le formulaire"
            >
              <X size={20} />
            </button>
          </div>
          <DefectForm config={FORM_CONFIGS[selectedFormKey]} onRefresh={loadRows} />
        </div>
      )}

      {editingDefect && canAddEdit && (
        <EditDefectModal
          defect={editingDefect}
          onClose={() => setEditingDefect(null)}
          onSuccess={loadRows}
        />
      )}

      <TableFilter
        columns={columns}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
      />

      {recentRows.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
          <p>Aucune donnée récente</p>
        </div>
      ) : (
        <SimpleTable
          title="Données Récentes"
          keyField="id"
          columns={columns}
          rows={recentRows}
          onEdit={canAddEdit ? handleEdit : null}
          onDelete={canDelete ? handleDelete : null}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
          showFilters={false}
        />
      )}

      {historicalRows.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
          <p>Aucune donnée historique</p>
        </div>
      ) : (
        <SimpleTable
          title="Données Historiques"
          keyField="id"
          columns={columns}
          rows={historicalRows}
          onEdit={canAddEdit ? handleEdit : null}
          onDelete={canDelete ? handleDelete : null}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
          showFilters={false}
        />
      )}
    </div>
  );
}
