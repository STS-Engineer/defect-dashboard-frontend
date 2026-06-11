import { TREATMENT_STATUS_COLORS } from "../utils/treatmentStatusUtils";

export default function TreatmentStatusBadge({ status }) {
  const config = TREATMENT_STATUS_COLORS[status] || {
    bg: "#6b7280",
    text: status || "-",
    color: "white",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 96,
        padding: "6px 10px",
        borderRadius: 999,
        background: config.bg,
        color: config.color,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {config.text}
    </span>
  );
}
