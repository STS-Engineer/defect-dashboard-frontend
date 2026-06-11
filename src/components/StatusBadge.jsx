import React from "react";

const STATUS_COLORS = {
  OUVERT: "#f59e0b",
  ATT_VALIDATION_PROD: "#2563eb",
  ATT_VALIDATION_QUALITE: "#7c3aed",
  RETOUR_PRODUCTION: "#ef4444",
  RETOUR_QUALITE: "#ef4444",
  CLOTURE: "#10b981",
  HISTORIQUE: "#6b7280",
};

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#6b7280";
  return (
    <span style={{
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: 9999,
      background: color,
      color: "white",
      fontWeight: 700,
      fontSize: 12,
    }}>
      {status}
    </span>
  );
}
