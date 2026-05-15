import { useEffect, useState } from "react";
import { api } from "../api";

export default function TablePage() {
  const [rows, setRows] = useState([]);

  async function loadRows() {
    const res = await api.get("/defects");
    setRows(res.data);
  }

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <div>
      <h1>Table principale</h1>

      <button onClick={loadRows}>Actualiser</button>

      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>BU</th>
              <th>Ligne</th>
              <th>Défaut</th>
              <th>Poste</th>
              <th>Equipe</th>
              <th>Nombre</th>
              <th>Mat CSL1</th>
              <th>Nom CSL1</th>
              <th>Mat CF</th>
              <th>Nom CF</th>
              <th>Quantité contrôlée</th>
              <th>Saisie totale</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date_detection}</td>
                <td>{r.bu}</td>
                <td>{r.ligne}</td>
                <td>{r.defaut}</td>
                <td>{r.poste}</td>
                <td>{r.equipe}</td>
                <td>{r.nombre}</td>
                <td>{r.mat_csl1}</td>
                <td>{r.prenom_nom_csl1}</td>
                <td>{r.mat_cf}</td>
                <td>{r.prenom_nom_cf}</td>
                <td>{r.quantite_controlee}</td>
                <td>{r.saisie_quantite_totale ? "Oui" : "Non"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}