import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import ChartCard from "../components/ChartCard";
import ChartFilter from "../components/ChartFilter";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  aggregateByLigne,
  aggregateByOperator,
  aggregateByPoste,
  aggregateDailyByLigne,
  aggregateMonthlyByBu,
  aggregateWeeklyByBu,
  extractChartOptions,
  filterDefects,
  INITIAL_CHART_FILTERS,
  
} from "../utils/chartDataUtils";
import { BU_COLORS, EQUIPE_COLORS, LIGNE_COLORS, POSTE_COLORS } from "../constants/tableColors";

const CHART_COLORS = {
  ...LIGNE_COLORS,
  ...BU_COLORS,
  ...POSTE_COLORS,
  ...EQUIPE_COLORS,
};

const STATUS_COLORS = {
  'OUVERT': '#3b82f6',
  'ATT_VALIDATION_PROD': '#f59e0b',
  'ATT_VALIDATION_QUALITE': '#a855f7',
  'RETOUR_PRODUCTION': '#ef4444',
  'RETOUR_QUALITE': '#ef4444',
  'CLOTURE': '#10b981',
  'HISTORIQUE': '#9ca3af',
};

const STATUS_LABELS = {
  'OUVERT': 'Ouvert',
  'ATT_VALIDATION_PROD': 'Att. validation prod',
  'ATT_VALIDATION_QUALITE': 'Att. validation qualité',
  'RETOUR_PRODUCTION': 'Retour production',
  'RETOUR_QUALITE': 'Retour qualité',
  'CLOTURE': 'Clôturé',
  'HISTORIQUE': 'Historique',
};

const OperatorTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="custom-tooltip">
      <div className="tooltip-header">Mat: {data.mat}</div>
      <div className="tooltip-subtitle">Nom: {data.name || data.operatrice}</div>
      <div className="tooltip-values">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="tooltip-row">
            <span>{entry.dataKey}</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStringOptions = (data, key) => {
  return [...new Set(
    data.flatMap((item) => {
      const value = item?.[key];
      return value === undefined || value === null
        ? []
        : [String(value)];
    })
  )].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
};

const getSeriesKeys = (data, excludedKey) => {
  return [...new Set(
    data.flatMap((item) =>
      Object.keys(item || {}).filter((key) => key !== excludedKey)
    )
  )];
};

const filterBySelectedValues = (data, filters, filterKey, dataKey = filterKey) => {
  const selected = filters[filterKey] || [];
  return selected.length
    ? data.filter((item) => selected.includes(String(item?.[dataKey])))
    : data;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [jour, setJour] = useState([]);
  const [semaine, setSemaine] = useState([]);
  const [ligne, setLigne] = useState([]);
  const [poste, setPoste] = useState([]);
  const [cf, setCf] = useState([]);
  const [csl1, setCsl1] = useState([]);
  const [mois, setMois] = useState([]);
  const [moisLigne, setMoisLigne] = useState([]);
  const [semainePoste, setSemainePoste] = useState([]);
  const [moisPoste, setMoisPoste] = useState([]);
  const [semainePosto, setSemainePosto] = useState([]);
  const [semainePosteCf, setSemainePosteCf] = useState([]);
  const [semainePosteCsl1, setSemainePosteCsl1] = useState([]);
  const [paretoMois, setParetoMois] = useState([]);
  const [quantiteControlee, setQuantiteControlee] = useState([]);
  const [paretoLigne, setParetoLigne] = useState([]);
  const [nombreDefaut, setNombreDefaut] = useState([]);
  const [nombreParSemaine, setNombreParSemaine] = useState([]);
  const [quantiteParLigneSemaine, setQuantiteParLigneSemaine] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [defects, setDefects] = useState([]);
  const [isSyncingMonday, setIsSyncingMonday] = useState(false);
  const [syncMondayMessage, setSyncMondayMessage] = useState("");
  const [dailyFilters, setDailyFilters] = useState(INITIAL_CHART_FILTERS);
  const [weeklyFilters, setWeeklyFilters] = useState(INITIAL_CHART_FILTERS);
  const [monthlyFilters, setMonthlyFilters] = useState(INITIAL_CHART_FILTERS);
  const [ligneFilters, setLigneFilters] = useState(INITIAL_CHART_FILTERS);
  const [posteFilters, setPosteFilters] = useState(INITIAL_CHART_FILTERS);
  const [cfFilters, setCfFilters] = useState(INITIAL_CHART_FILTERS);
  const [csl1Filters, setCsl1Filters] = useState(INITIAL_CHART_FILTERS);
  const [defautParLigneFilters, setDefautParLigneFilters] = useState(INITIAL_CHART_FILTERS);
  const [paretoLigneFilters, setParetoLigneFilters] = useState(INITIAL_CHART_FILTERS);
  const [semainePosteGlobalFilters, setSemainePosteGlobalFilters] = useState(INITIAL_CHART_FILTERS);
  const [moisPosteGlobalFilters, setMoisPosteGlobalFilters] = useState(INITIAL_CHART_FILTERS);
  const [moisLigneFilters, setMoisLigneFilters] = useState(INITIAL_CHART_FILTERS);
  const [semainePostoFilters, setSemainePostoFilters] = useState(INITIAL_CHART_FILTERS);
  const [semainePosteCfFilters, setSemainePosteCfFilters] = useState(INITIAL_CHART_FILTERS);
  const [semainePosteCsl1Filters, setSemainePosteCsl1Filters] = useState(INITIAL_CHART_FILTERS);
  const [paretoMoisFilters, setParetoMoisFilters] = useState(INITIAL_CHART_FILTERS);
  const [quantiteControleeFilters, setQuantiteControleeFilters] = useState(INITIAL_CHART_FILTERS);
  const [nombreParSemaineFilters, setNombreParSemaineFilters] = useState(INITIAL_CHART_FILTERS);
  const [quantiteParLigneSemaineFilters, setQuantiteParLigneSemaineFilters] = useState(INITIAL_CHART_FILTERS);

  const loadData = useCallback(async () => {
    const [
      defectsRes,
      summaryRes,
      jourRes,
      semaineRes,
      ligneRes,
      posteRes,
      cfRes,
      csl1Res,
      moisRes,
      moisLigneRes,
      semainPosteRes,
      moisPosteRes,
      semainePosToRes,
      semainePosteCfRes,
      semainePosteCsl1Res,
      paretoMoisRes,
      quantiteCRes,
      paretoLigneRes,
      nombreDefautRes,
      nombreParSemaineRes,
      quantiteParLigneSemaineRes,
      statusDistributionRes,
    ] = await Promise.all([
      api.get("/defects"),
      api.get("/dashboards/summary"),
      api.get("/dashboards/defauts-par-jour"),
      api.get("/dashboards/defauts-par-semaine"),
      api.get("/dashboards/defauts-par-ligne"),
      api.get("/dashboards/defauts-par-poste"),
      api.get("/dashboards/analyse-operatrice-cf"),
      api.get("/dashboards/analyse-operatrice-csl1"),
      api.get("/dashboards/defauts-par-mois"),
      api.get("/dashboards/defauts-par-mois-ligne"),
      api.get("/dashboards/defauts-par-semaine-poste"),
      api.get("/dashboards/defauts-par-mois-poste"),
      api.get("/dashboards/defauts-par-semaine-poste-test-electrique"),
      api.get("/dashboards/defauts-par-semaine-poste-cf"),
      api.get("/dashboards/defauts-par-semaine-poste-csl1"),
      api.get("/dashboards/pareto-defauts-par-mois"),
      api.get("/dashboards/quantite-controlee-par-semaine"),
      api.get("/dashboards/pareto-defauts-par-ligne"),
      api.get("/dashboards/nombre-defauts-par-defaut"),
      api.get("/dashboards/nombre-par-semaine"),
      api.get("/dashboards/quantite-par-ligne-semaine-actuelle"),
      api.get("/dashboards/status-distribution"),
    ]);

    setDefects(defectsRes.data);
    setSummary(summaryRes.data);
    setJour(jourRes.data);
    setSemaine(semaineRes.data);
    setLigne(ligneRes.data);
    setPoste(posteRes.data);
    setCf(cfRes.data);
    setCsl1(csl1Res.data);
    setMois(moisRes.data);
    setMoisLigne(moisLigneRes.data);
    setSemainePoste(semainPosteRes.data);
    setMoisPoste(moisPosteRes.data);
    setSemainePosto(semainePosToRes.data);
    setSemainePosteCf(semainePosteCfRes.data);
    setSemainePosteCsl1(semainePosteCsl1Res.data);
    setParetoMois(paretoMoisRes.data);
    setQuantiteControlee(quantiteCRes.data);
    setParetoLigne(paretoLigneRes.data);
    setNombreDefaut(nombreDefautRes.data);
    setNombreParSemaine(nombreParSemaineRes.data);
    setQuantiteParLigneSemaine(quantiteParLigneSemaineRes.data);
    setStatusData(statusDistributionRes.data);
  }, []);

  const syncMonday = useCallback(async () => {
    setIsSyncingMonday(true);
    setSyncMondayMessage("");

    try {
      await api.post("/sync/monday");
      await loadData();
      setSyncMondayMessage("Synchronisation Monday terminée.");
    } catch {
      setSyncMondayMessage("Erreur lors de la synchronisation Monday.");
    } finally {
      setIsSyncingMonday(false);
    }
  }, [loadData]);

  const chartOptions = useMemo(() => extractChartOptions(defects), [defects]);

  const filteredDailyDefects = useMemo(
    () => filterDefects(defects, dailyFilters),
    [defects, dailyFilters]
  );
  const filteredWeeklyDefects = useMemo(
    () => filterDefects(defects, weeklyFilters),
    [defects, weeklyFilters]
  );
  const filteredMonthlyDefects = useMemo(
    () => filterDefects(defects, monthlyFilters),
    [defects, monthlyFilters]
  );
  const filteredLigneDefects = useMemo(
    () => filterDefects(defects, ligneFilters),
    [defects, ligneFilters]
  );
  const filteredPosteDefects = useMemo(
    () => filterDefects(defects, posteFilters),
    [defects, posteFilters]
  );
  const filteredCfDefects = useMemo(
    () => filterDefects(defects, cfFilters),
    [defects, cfFilters]
  );
  const filteredCsl1Defects = useMemo(
    () => filterDefects(defects, csl1Filters),
    [defects, csl1Filters]
  );

  const dailyChartData = useMemo(
    () => (defects.length ? aggregateDailyByLigne(filteredDailyDefects) : jour),
    [defects.length, filteredDailyDefects, jour]
  );
  const dailyChartLines = useMemo(
    () =>
      dailyChartData.length > 0
        ? Object.keys(dailyChartData[0]).filter((key) => key !== "date")
        : [],
    [dailyChartData]
  );
  const weeklyChartData = useMemo(
    () => (defects.length ? aggregateWeeklyByBu(filteredWeeklyDefects) : semaine),
    [defects.length, filteredWeeklyDefects, semaine]
  );
  const monthlyChartData = useMemo(
    () => (defects.length ? aggregateMonthlyByBu(filteredMonthlyDefects) : mois),
    [defects.length, filteredMonthlyDefects, mois]
  );
  const ligneChartData = useMemo(
    () => (defects.length ? aggregateByLigne(filteredLigneDefects) : ligne),
    [defects.length, filteredLigneDefects, ligne]
  );
  const posteChartData = useMemo(
    () => (defects.length ? aggregateByPoste(filteredPosteDefects) : poste),
    [defects.length, filteredPosteDefects, poste]
  );
  const cfChartData = useMemo(
    () =>
      defects.length
        ? aggregateByOperator(filteredCfDefects, "prenom_nom_cf", "mat_cf", "prenom_nom_cf")
        : cf,
    [defects.length, filteredCfDefects, cf]
  );
  const csl1ChartData = useMemo(
    () =>
      defects.length
        ? aggregateByOperator(filteredCsl1Defects, "prenom_nom_csl1", "mat_csl1", "prenom_nom_csl1")
        : csl1,
    [defects.length, filteredCsl1Defects, csl1]
  );

  const filterOptions = {
    defaut: chartOptions.defautOptions,
    ligne: chartOptions.ligneOptions,
    operateur: chartOptions.operateurOptions,
  };

  const defautParLigneOptions = useMemo(
    () => getStringOptions(nombreDefaut, "defaut"),
    [nombreDefaut]
  );
  const paretoLigneOptions = useMemo(
    () => getStringOptions(paretoLigne, "ligne"),
    [paretoLigne]
  );
  const semainePosteOptions = useMemo(
    () => getStringOptions(semainePoste, "semaine"),
    [semainePoste]
  );
  const moisPosteOptions = useMemo(
    () => getStringOptions(moisPoste, "mois"),
    [moisPoste]
  );
  const moisLigneOptions = useMemo(
    () => getStringOptions(moisLigne, "mois"),
    [moisLigne]
  );
  const moisLigneLines = useMemo(
    () => getSeriesKeys(moisLigne, "mois"),
    [moisLigne]
  );
  const semainePostoOptions = useMemo(
    () => getStringOptions(semainePosto, "semaine"),
    [semainePosto]
  );
  const semainePostoLignes = useMemo(
    () => getSeriesKeys(semainePosto, "semaine"),
    [semainePosto]
  );
  const semainePosteCfOptions = useMemo(
    () => getStringOptions(semainePosteCf, "semaine"),
    [semainePosteCf]
  );
  const semainePosteCfLignes = useMemo(
    () => getSeriesKeys(semainePosteCf, "semaine"),
    [semainePosteCf]
  );
  const semainePosteCsl1Options = useMemo(
    () => getStringOptions(semainePosteCsl1, "semaine"),
    [semainePosteCsl1]
  );
  const semainePosteCsl1Lignes = useMemo(
    () => getSeriesKeys(semainePosteCsl1, "semaine"),
    [semainePosteCsl1]
  );
  const paretoMoisOptions = useMemo(
    () => getStringOptions(paretoMois, "mois"),
    [paretoMois]
  );
  const quantiteControleeOptions = useMemo(
    () => getStringOptions(quantiteControlee, "semaine"),
    [quantiteControlee]
  );
  const nombreParSemaineOptions = useMemo(
    () => getStringOptions(nombreParSemaine, "semaine"),
    [nombreParSemaine]
  );

  const quantiteParLigneSemaineLines = useMemo(
    () =>
      Object.keys(quantiteParLigneSemaine[0] || {}).filter((key) => key !== "date"),
    [quantiteParLigneSemaine]
  );

  const filteredNombreDefaut = useMemo(
    () =>
      defautParLigneFilters.defaut?.length
        ? nombreDefaut.filter((item) => defautParLigneFilters.defaut.includes(item.defaut))
        : nombreDefaut,
    [nombreDefaut, defautParLigneFilters]
  );

  const filteredParetoLigne = useMemo(
    () =>
      paretoLigneFilters.ligne?.length
        ? paretoLigne.filter((item) => paretoLigneFilters.ligne.includes(item.ligne))
        : paretoLigne,
    [paretoLigne, paretoLigneFilters]
  );

  const filteredSemainePoste = useMemo(
    () =>
      semainePosteGlobalFilters.semaine?.length
        ? semainePoste.filter((item) => semainePosteGlobalFilters.semaine.includes(String(item.semaine)))
        : semainePoste,
    [semainePoste, semainePosteGlobalFilters]
  );

  const filteredMoisPoste = useMemo(
    () =>
      moisPosteGlobalFilters.mois?.length
        ? moisPoste.filter((item) => moisPosteGlobalFilters.mois.includes(String(item.mois)))
        : moisPoste,
    [moisPoste, moisPosteGlobalFilters]
  );

  const filteredMoisLigne = useMemo(
    () => filterBySelectedValues(moisLigne, moisLigneFilters, "mois"),
    [moisLigne, moisLigneFilters]
  );

  const displayMoisLigneLines = useMemo(
    () =>
      moisLigneFilters.ligne?.length
        ? moisLigneFilters.ligne
        : moisLigneLines,
    [moisLigneFilters.ligne, moisLigneLines]
  );

  const filteredSemainePosto = useMemo(
    () =>
      semainePostoFilters.semaine?.length
        ? semainePosto.filter((item) => semainePostoFilters.semaine.includes(String(item.semaine)))
        : semainePosto,
    [semainePosto, semainePostoFilters]
  );

  const filteredSemainePosteCf = useMemo(
    () =>
      semainePosteCfFilters.semaine?.length
        ? semainePosteCf.filter((item) => semainePosteCfFilters.semaine.includes(String(item.semaine)))
        : semainePosteCf,
    [semainePosteCf, semainePosteCfFilters]
  );

  const filteredSemainePosteCsl1 = useMemo(
    () =>
      semainePosteCsl1Filters.semaine?.length
        ? semainePosteCsl1.filter((item) => semainePosteCsl1Filters.semaine.includes(String(item.semaine)))
        : semainePosteCsl1,
    [semainePosteCsl1, semainePosteCsl1Filters]
  );

  const filteredParetoMois = useMemo(
    () =>
      paretoMoisFilters.mois?.length
        ? paretoMois.filter((item) => paretoMoisFilters.mois.includes(String(item.mois)))
        : paretoMois,
    [paretoMois, paretoMoisFilters]
  );

  const filteredQuantiteControlee = useMemo(
    () =>
      quantiteControleeFilters.semaine?.length
        ? quantiteControlee.filter((item) => quantiteControleeFilters.semaine.includes(String(item.semaine)))
        : quantiteControlee,
    [quantiteControlee, quantiteControleeFilters]
  );

  const filteredNombreParSemaine = useMemo(
    () =>
      nombreParSemaineFilters.semaine?.length
        ? nombreParSemaine.filter((item) => nombreParSemaineFilters.semaine.includes(String(item.semaine)))
        : nombreParSemaine,
    [nombreParSemaine, nombreParSemaineFilters]
  );

  const filteredQuantiteParLigneSemaine = useMemo(() => {
    if (!quantiteParLigneSemaineFilters.dateFrom && !quantiteParLigneSemaineFilters.dateTo) {
      return quantiteParLigneSemaine;
    }

    return quantiteParLigneSemaine.filter((item) => {
      if (!item.date) return false;
      if (
        quantiteParLigneSemaineFilters.dateFrom &&
        item.date < quantiteParLigneSemaineFilters.dateFrom
      ) {
        return false;
      }
      if (
        quantiteParLigneSemaineFilters.dateTo &&
        item.date > quantiteParLigneSemaineFilters.dateTo
      ) {
        return false;
      }
      return true;
    });
  }, [quantiteParLigneSemaine, quantiteParLigneSemaineFilters]);

  const displayQuantiteParLigneSemaineLines = useMemo(
    () =>
      quantiteParLigneSemaineFilters.ligne?.length
        ? quantiteParLigneSemaineFilters.ligne
        : quantiteParLigneSemaineLines,
    [quantiteParLigneSemaineFilters.ligne, quantiteParLigneSemaineLines]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  return (
    <div style={{ width: "100%", maxWidth: "100%", padding: 0, margin: 0 }}>
      <h1>Dashboards Qualité</h1>

      <button 
        onClick={syncMonday}
        disabled={isSyncingMonday}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0066CC",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        {isSyncingMonday ? "Synchronisation..." : "Synchroniser depuis Monday"}
      </button>

      {syncMondayMessage && (
        <p style={{ marginTop: -8, marginBottom: 20, fontWeight: 700 }}>
          {syncMondayMessage}
        </p>
      )}

      {summary && (
        <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
          <ChartCard title="Total défauts">
            <h2 style={{ color: "#0066CC", margin: 0 }}>{summary.total_defauts}</h2>
          </ChartCard>

          <ChartCard title="Lignes table">
            <h2 style={{ color: "#0066CC", margin: 0 }}>{summary.total_rows}</h2>
          </ChartCard>

          <ChartCard title="Quantité contrôlée">
            <h2 style={{ color: "#0066CC", margin: 0 }}>{summary.total_quantite_controlee}</h2>
          </ChartCard>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <ChartCard title="Répartition par statut de traitement">
          {statusData.length === 0 ? (
            <div className="no-data-state">Aucun résultat</div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width={500} height={350}>
                <PieChart>
                  {(() => {
                    // Merge duplicate status entries
                    const mergedData = statusData.reduce((acc, item) => {
                      const existing = acc.find(d => d.status === item.status);
                      if (existing) {
                        existing.count += item.count;
                      } else {
                        acc.push({...item});
                      }
                      return acc;
                    }, []);
                    
                    const totalCount = mergedData.reduce((sum, item) => sum + item.count, 0);
                    
                    return (
                      <>
                        <Pie
                          data={mergedData}
                          dataKey="count"
                          nameKey="status"
                          cx="45%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                        >
                          {mergedData.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={STATUS_COLORS[entry.status] || '#9ca3af'}
                            />
                          ))}
                          {/* Center text showing total count */}
                          <text x="45%" y="45%" textAnchor="middle" 
                                dominantBaseline="middle" 
                                style={{fontSize: '24px', fontWeight: 'bold'}}>
                            {totalCount}
                          </text>
                          <text x="45%" y="53%" textAnchor="middle"
                                dominantBaseline="middle"
                                style={{fontSize: '12px', fill: '#666'}}>
                            Total défauts
                          </text>
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} défauts`,
                            STATUS_LABELS[name] || name
                          ]}
                        />
                        <Legend
                          formatter={(value, entry) => 
                            `${STATUS_LABELS[value] || value}: ${entry.payload.count}`
                          }
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                        />
                      </>
                    );
                  })()}
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

        <ChartCard
          title="Nombre de défauts par jour"
          filters={
            <ChartFilter
              filters={dailyFilters}
              onFilterChange={setDailyFilters}
              onClearFilters={() => setDailyFilters(INITIAL_CHART_FILTERS)}
              options={filterOptions}
              fields={["defaut", "date", "ligne", "operateur"]}
            />
          }
        >
          {dailyChartData.length === 0 ? (
            <div className="no-data-state">Aucun résultat pour ces filtres.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dailyChartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />

                <YAxis tick={{ fontSize: 12 }} />

                <Tooltip />

                <Legend wrapperStyle={{ paddingTop: "10px" }} />

                {dailyChartLines.map((ligne) => (
                  <Bar
                    key={ligne}
                    dataKey={ligne}
                    stackId="a"
                    fill={CHART_COLORS[ligne] || "#9CA3AF"}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Nombre de défauts par semaine"
          filters={
            <ChartFilter
              filters={weeklyFilters}
              onFilterChange={setWeeklyFilters}
              onClearFilters={() => setWeeklyFilters(INITIAL_CHART_FILTERS)}
              options={filterOptions}
              fields={["defaut", "date", "ligne"]}
            />
          }
        >
          {weeklyChartData.length === 0 ? (
            <div className="no-data-state">Aucun résultat pour ces filtres.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="semaine" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar dataKey="VALEO" stackId="a" fill={CHART_COLORS["VALEO"]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="NIDEC" stackId="a" fill={CHART_COLORS["NIDEC"]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        

        <ChartCard
          title="Nombre de défauts par Ligne"
          filters={
            <ChartFilter
              filters={ligneFilters}
              onFilterChange={setLigneFilters}
              onClearFilters={() => setLigneFilters(INITIAL_CHART_FILTERS)}
              options={filterOptions}
              fields={["defaut", "date", "ligne", "operateur"]}
            />
          }
        >
          {ligneChartData.length === 0 ? (
            <div className="no-data-state">Aucun résultat pour ces filtres.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ligneChartData} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ligne" tick={{ fontSize: 11 }} angle={-65} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}> 
                  {ligneChartData.map((entry) => (
                    <Cell key={entry.ligne} fill={CHART_COLORS[entry.ligne] || "#0066CC"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Nombre de défauts par poste"
          filters={
            <ChartFilter
              filters={posteFilters}
              onFilterChange={setPosteFilters}
              onClearFilters={() => setPosteFilters(INITIAL_CHART_FILTERS)}
              options={filterOptions}
              fields={["defaut", "date", "ligne"]}
            />
          }
        >
          {posteChartData.length === 0 ? (
            <div className="no-data-state">Aucun résultat pour ces filtres.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={posteChartData} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="poste" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar dataKey="total" fill="#0066CC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Nombre de défauts par ligne "
          filters={
            <ChartFilter
              filters={defautParLigneFilters}
              onFilterChange={setDefautParLigneFilters}
              onClearFilters={() => setDefautParLigneFilters(INITIAL_CHART_FILTERS)}
              options={{ defaut: defautParLigneOptions }}
              fields={["defaut"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={filteredNombreDefaut}
              margin={{ top: 5, right: 30, left: 0, bottom: 160 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              <XAxis
                dataKey="defaut"
                interval={0}
                height={160}
                tick={({ x, y, payload }) => {
                  const text =
                    payload.value.length > 18
                      ? payload.value.substring(0, 18) + "..."
                      : payload.value;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="end"
                        fill="#666"
                        transform="rotate(-65)"
                        fontSize={10}
                      >
                        {text}
                      </text>
                    </g>
                  );
                }}
              />

              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip />

              <Legend wrapperStyle={{ paddingTop: "10px" }} />

              <Bar
                dataKey="FLEX 1"
                stackId="a"
                fill={CHART_COLORS["FLEX 1"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="FLEX 2"
                stackId="a"
                fill={CHART_COLORS["FLEX 2"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="FLEX 3"
                stackId="a"
                fill={CHART_COLORS["FLEX 3"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="GEN2 C"
                stackId="a"
                fill={CHART_COLORS["GEN2 C"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="GEN2 R"
                stackId="a"
                fill={CHART_COLORS["GEN2 R"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="MNG2-1"
                stackId="a"
                fill={CHART_COLORS["MNG2-1"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="MNG2-2"
                stackId="a"
                fill={CHART_COLORS["MNG2-2"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="CM3"
                stackId="a"
                fill={CHART_COLORS["CM3"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="CM4"
                stackId="a"
                fill={CHART_COLORS["CM4"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="VM4 1"
                stackId="a"
                fill={CHART_COLORS["VM4 1"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="VM4 2"
                stackId="a"
                fill={CHART_COLORS["VM4 2"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="DCk"
                stackId="a"
                fill={CHART_COLORS["DCk"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="B8"
                stackId="a"
                fill={CHART_COLORS["B8"]}
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="11TA"
                stackId="a"
                fill={CHART_COLORS["11TA"]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pareto des défauts / Ligne"
          filters={
            <ChartFilter
              filters={paretoLigneFilters}
              onFilterChange={setParetoLigneFilters}
              onClearFilters={() => setParetoLigneFilters(INITIAL_CHART_FILTERS)}
              options={{ ligne: paretoLigneOptions }}
              fields={["ligne"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredParetoLigne} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="ligne" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="Matin" stackId="a" fill="#beda1f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Après-midi" stackId="a" fill="#0fa5f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Nuit" stackId="a" fill="#EC4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Vide" stackId="a" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Pareto des défauts / Mois"
          filters={
            <ChartFilter
              filters={paretoMoisFilters}
              onFilterChange={setParetoMoisFilters}
              onClearFilters={() => setParetoMoisFilters(INITIAL_CHART_FILTERS)}
              options={{ mois: paretoMoisOptions }}
              fields={["mois"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredParetoMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Analyse opératrice CF"
          filters={
            <ChartFilter
              filters={cfFilters}
              onFilterChange={setCfFilters}
              onClearFilters={() => setCfFilters(INITIAL_CHART_FILTERS)}
              options={filterOptions}
              fields={["defaut", "date", "ligne"]}
            />
          }
        >
          {cfChartData.length === 0 ? (
            <div className="no-data-state">Aucun résultat pour ces filtres.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cfChartData} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="mat"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  angle={0}
                  textAnchor="middle"
                  height={50}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<OperatorTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar dataKey="VALEO" stackId="a" fill={CHART_COLORS["VALEO"]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="NIDEC" stackId="a" fill={CHART_COLORS["NIDEC"]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Analyse opératrice CSL1"
          filters={
            <ChartFilter
              filters={csl1Filters}
              onFilterChange={setCsl1Filters}
              onClearFilters={() => setCsl1Filters(INITIAL_CHART_FILTERS)}
              options={filterOptions}
              fields={["defaut", "date", "ligne"]}
            />
          }
        >
          {csl1ChartData.length === 0 ? (
            <div className="no-data-state">Aucun résultat pour ces filtres.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={csl1ChartData} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="mat"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  angle={0}
                  textAnchor="middle"
                  height={50}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<OperatorTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar dataKey="VALEO" stackId="a" fill={CHART_COLORS["VALEO"]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="NIDEC" stackId="a" fill={CHART_COLORS["NIDEC"]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        
        <ChartCard
          title="Nombre de défauts par mois"
          filters={
            <ChartFilter
              filters={monthlyFilters}
              onFilterChange={setMonthlyFilters}
              onClearFilters={() => setMonthlyFilters(INITIAL_CHART_FILTERS)}
              options={filterOptions}
              fields={["defaut", "date", "ligne", "operateur"]}
            />
          }
        >
          {monthlyChartData.length === 0 ? (
            <div className="no-data-state">Aucun résultat pour ces filtres.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar dataKey="VALEO" stackId="a" fill={CHART_COLORS["VALEO"]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="NIDEC" stackId="a" fill={CHART_COLORS["NIDEC"]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Nombre de défauts par mois / ligne"
          filters={
            <ChartFilter
              filters={moisLigneFilters}
              onFilterChange={setMoisLigneFilters}
              onClearFilters={() => setMoisLigneFilters(INITIAL_CHART_FILTERS)}
              options={{ mois: moisLigneOptions, ligne: moisLigneLines }}
              fields={["mois", "ligne"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredMoisLigne}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              {displayMoisLigneLines.map((ligne) => (
                <Bar
                  key={ligne}
                  dataKey={ligne}
                  stackId="a"
                  fill={CHART_COLORS[ligne] || "#9CA3AF"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Nombre de défauts par semaine / poste globale "
          filters={
            <ChartFilter
              filters={semainePosteGlobalFilters}
              onFilterChange={setSemainePosteGlobalFilters}
              onClearFilters={() => setSemainePosteGlobalFilters(INITIAL_CHART_FILTERS)}
              options={{ semaine: semainePosteOptions }}
              fields={["semaine"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredSemainePoste}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semaine" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="CSL1" stackId="a" fill={CHART_COLORS["CSL1"]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="CF" stackId="a" fill={CHART_COLORS["CF"]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Test électrique" stackId="a" fill={CHART_COLORS["Test électrique"]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Nombre de défauts par mois / poste globale"
          filters={
            <ChartFilter
              filters={moisPosteGlobalFilters}
              onFilterChange={setMoisPosteGlobalFilters}
              onClearFilters={() => setMoisPosteGlobalFilters(INITIAL_CHART_FILTERS)}
              options={{ mois: moisPosteOptions }}
              fields={["mois"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredMoisPoste}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="CSL1" stackId="a" fill={CHART_COLORS["CSL1"]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="CF" stackId="a" fill={CHART_COLORS["CF"]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Test électrique" stackId="a" fill={CHART_COLORS["Test électrique"]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Nombre de défauts par semaine - Poste Test électrique"
          filters={
            <ChartFilter
              filters={semainePostoFilters}
              onFilterChange={setSemainePostoFilters}
              onClearFilters={() => setSemainePostoFilters(INITIAL_CHART_FILTERS)}
              options={{ semaine: semainePostoOptions }}
              fields={["semaine"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={filteredSemainePosto}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              <XAxis dataKey="semaine" tick={{ fontSize: 11 }} />

              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip />

              <Legend />

              {semainePostoLignes.map((ligne) => (
                <Bar
                  key={ligne}
                  dataKey={ligne}
                  stackId="a"
                  fill={CHART_COLORS[ligne] || "#9CA3AF"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>


        <ChartCard
          title="Nombre de défauts par semaine Poste CF"
          filters={
            <ChartFilter
              filters={semainePosteCfFilters}
              onFilterChange={setSemainePosteCfFilters}
              onClearFilters={() => setSemainePosteCfFilters(INITIAL_CHART_FILTERS)}
              options={{ semaine: semainePosteCfOptions }}
              fields={["semaine"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={filteredSemainePosteCf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              <XAxis dataKey="semaine" tick={{ fontSize: 11 }} />

              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip />

              <Legend />

              {semainePosteCfLignes.map((ligne) => (
                <Bar
                  key={ligne}
                  dataKey={ligne}
                  stackId="a"
                  fill={CHART_COLORS[ligne] || "#9CA3AF"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      
        <ChartCard
          title="Défauts par semaine - Poste CSL1"
          filters={
            <ChartFilter
              filters={semainePosteCsl1Filters}
              onFilterChange={setSemainePosteCsl1Filters}
              onClearFilters={() => setSemainePosteCsl1Filters(INITIAL_CHART_FILTERS)}
              options={{ semaine: semainePosteCsl1Options }}
              fields={["semaine"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={filteredSemainePosteCsl1}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              <XAxis dataKey="semaine" tick={{ fontSize: 11 }} />

              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip />

              <Legend />

              {semainePosteCsl1Lignes.map((ligne) => (
                <Bar
                  key={ligne}
                  dataKey={ligne}
                  stackId="a"
                  fill={CHART_COLORS[ligne] || "#9CA3AF"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        
          <ChartCard
            title="Pareto des défauts par mois"
            filters={
              <ChartFilter
                filters={paretoMoisFilters}
                onFilterChange={setParetoMoisFilters}
                onClearFilters={() => setParetoMoisFilters(INITIAL_CHART_FILTERS)}
                options={{ mois: paretoMoisOptions }}
                fields={["mois"]}
              />
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredParetoMois}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#0066CC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        <ChartCard
          title="Quantité Contrôlée"
          filters={
            <ChartFilter
              filters={quantiteControleeFilters}
              onFilterChange={setQuantiteControleeFilters}
              onClearFilters={() => setQuantiteControleeFilters(INITIAL_CHART_FILTERS)}
              options={{ semaine: quantiteControleeOptions }}
              fields={["semaine"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredQuantiteControlee} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semaine" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="Détection de défauts" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Quantité" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Nombre / semaine"
          filters={
            <ChartFilter
              filters={nombreParSemaineFilters}
              onFilterChange={setNombreParSemaineFilters}
              onClearFilters={() => setNombreParSemaineFilters(INITIAL_CHART_FILTERS)}
              options={{ semaine: nombreParSemaineOptions }}
              fields={["semaine"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredNombreParSemaine} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semaine" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line dataKey="nombre" stroke="#0066CC" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Quantité Contrôlée / ligne / Cette Semaine"
          filters={
            <ChartFilter
              filters={quantiteParLigneSemaineFilters}
              onFilterChange={setQuantiteParLigneSemaineFilters}
              onClearFilters={() => setQuantiteParLigneSemaineFilters(INITIAL_CHART_FILTERS)}
              options={{ ligne: quantiteParLigneSemaineLines }}
              fields={["ligne", "date"]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredQuantiteParLigneSemaine} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              {displayQuantiteParLigneSemaineLines.map((ligne) => (
                <Bar
                  key={ligne}
                  dataKey={ligne}
                  stackId="a"
                  fill={CHART_COLORS[ligne] || "#9CA3AF"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
