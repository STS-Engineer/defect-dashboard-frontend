import { useEffect, useState } from "react";
import { api } from "../api";
import ChartCard from "../components/ChartCard";
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
} from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [jour, setJour] = useState([]);
  const [semaine, setSemaine] = useState([]);
  const [ligne, setLigne] = useState([]);
  const [poste, setPoste] = useState([]);
  const [pareto, setPareto] = useState([]);
  const [cf, setCf] = useState([]);
  const [csl1, setCsl1] = useState([]);

  async function loadData() {
    const [
      summaryRes,
      jourRes,
      semaineRes,
      ligneRes,
      posteRes,
      paretoRes,
      cfRes,
      csl1Res,
    ] = await Promise.all([
      api.get("/dashboards/summary"),
      api.get("/dashboards/defauts-par-jour"),
      api.get("/dashboards/defauts-par-semaine"),
      api.get("/dashboards/defauts-par-ligne"),
      api.get("/dashboards/defauts-par-poste"),
      api.get("/dashboards/pareto-defauts"),
      api.get("/dashboards/analyse-operatrice-cf"),
      api.get("/dashboards/analyse-operatrice-csl1"),
    ]);

    setSummary(summaryRes.data);
    setJour(jourRes.data);
    setSemaine(semaineRes.data);
    setLigne(ligneRes.data);
    setPoste(posteRes.data);
    setPareto(paretoRes.data);
    setCf(cfRes.data);
    setCsl1(csl1Res.data);
  }

  async function syncMonday() {
    await api.post("/sync/monday");
    await loadData();
    alert("Synchronisation terminée");
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1>Dashboards Qualité</h1>

      <button onClick={syncMonday}>Synchroniser depuis Monday</button>

      {summary && (
        <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
          <ChartCard title="Total défauts">
            <h2>{summary.total_defauts}</h2>
          </ChartCard>

          <ChartCard title="Lignes table">
            <h2>{summary.total_rows}</h2>
          </ChartCard>

          <ChartCard title="Quantité contrôlée">
            <h2>{summary.total_quantite_controlee}</h2>
          </ChartCard>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title="Nombre de défauts par jour">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={jour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nombre de défauts par semaine">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={semaine}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semaine" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nombre de défauts par ligne">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ligne}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ligne" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nombre de défauts par poste">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={poste}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="poste" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pareto des défauts">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pareto}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="defaut" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Analyse opératrice CF">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cf}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="operatrice" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Analyse opératrice CSL1">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={csl1}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="operatrice" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}