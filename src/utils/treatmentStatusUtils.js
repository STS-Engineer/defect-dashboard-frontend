import { normalizeSuperviseurValue } from "../constants/lineConfig";

export const BASE_TREATMENT_STATUS_OPTIONS = [
  "HISTORIQUE",
  "OUVERT",
  "Att validation prod",
  "Refus\u00e9",
  "Att validation qualit\u00e9",
  "Valid\u00e9",
];

export const TREATMENT_STATUS_COLORS = {
  HISTORIQUE: { bg: "#9ca3af", text: "Historique", color: "white" },
  OUVERT: { bg: "#3b82f6", text: "Ouvert", color: "white" },
  "Att validation prod": { bg: "#f59e0b", text: "Att validation prod", color: "white" },
  "Refus\u00e9": { bg: "#ef4444", text: "Refus\u00e9", color: "white" },
  "Att validation qualit\u00e9": { bg: "#a855f7", text: "Att validation qualit\u00e9", color: "white" },
  "Valid\u00e9": { bg: "#10b981", text: "Valid\u00e9", color: "white" },
};

const STATUS_LABELS = {
  HISTORIQUE: "HISTORIQUE",
  OUVERT: "OUVERT",
  ATT_VALIDATION_PROD: "Att validation prod",
  "Att validation prod": "Att validation prod",
  RETOUR_PRODUCTION: "Refus\u00e9",
  RETOUR_QUALITE: "Refus\u00e9",
  Refuse: "Refus\u00e9",
  "Refus\u00e9": "Refus\u00e9",
  "Refus\u00e9 (Production)": "Refus\u00e9",
  "Refus\u00e9 (Qualit\u00e9)": "Refus\u00e9",
  ATT_VALIDATION_QUALITE: "Att validation qualit\u00e9",
  "Att validation qualite": "Att validation qualit\u00e9",
  "Att validation qualit\u00e9": "Att validation qualit\u00e9",
  CLOTURE: "Valid\u00e9",
  Valide: "Valid\u00e9",
  "Valid\u00e9": "Valid\u00e9",
};

export function normalizeTreatmentStatus(rowOrStatus, superviseurValue) {
  const isRow = rowOrStatus && typeof rowOrStatus === "object";
  const rawStatus = isRow
    ? rowOrStatus.treatment_status || rowOrStatus.status
    : rowOrStatus;
  const rawSuperviseur = isRow
    ? rowOrStatus.superviseur || rowOrStatus.equipe
    : superviseurValue;

  if (!rawStatus) {
    const normalizedSuperviseur = normalizeSuperviseurValue(rawSuperviseur);
    return String(normalizedSuperviseur).toLowerCase().startsWith("non assign")
      ? "HISTORIQUE"
      : "OUVERT";
  }

  return STATUS_LABELS[String(rawStatus).trim()] || String(rawStatus).trim();
}

export function getTreatmentStatusFilterValue(row) {
  return normalizeTreatmentStatus(row);
}

export function buildTreatmentStatusOptions(rows = []) {
  const discoveredStatuses = rows
    .map((row) => normalizeTreatmentStatus(row))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  return Array.from(new Set([...BASE_TREATMENT_STATUS_OPTIONS, ...discoveredStatuses]));
}
