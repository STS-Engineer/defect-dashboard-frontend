function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateKey(value) {
  const date = parseDate(value);
  if (!date) return "";
  return date.toISOString().substring(0, 10);
}

function formatMonthKey(value) {
  const date = parseDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function sortText(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

export const INITIAL_CHART_FILTERS = {
  defaut: [],
  dateFrom: "",
  dateTo: "",
  ligne: [],
  operateur: [],
};

export function extractChartOptions(defects) {
  const defautOptions = sortText(defects.map((item) => item.defaut));
  const ligneOptions = sortText(defects.map((item) => item.ligne));
  const operateurSet = new Set();

  defects.forEach((item) => {
    if (item.prenom_nom_cf) operateurSet.add(item.prenom_nom_cf);
    if (item.prenom_nom_csl1) operateurSet.add(item.prenom_nom_csl1);
  });

  return {
    defautOptions,
    ligneOptions,
    operateurOptions: sortText(Array.from(operateurSet)),
  };
}

export function filterDefects(defects, filters) {
  return defects.filter((row) => {
    if (filters.defaut?.length > 0 && !filters.defaut.includes(row.defaut)) {
      return false;
    }

    if (filters.ligne?.length > 0 && !filters.ligne.includes(row.ligne)) {
      return false;
    }

    if (filters.operateur?.length > 0) {
      const operators = [row.prenom_nom_cf, row.prenom_nom_csl1].filter(Boolean);
      if (!operators.some((operator) => filters.operateur.includes(operator))) {
        return false;
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      const date = parseDate(row.date_detection);
      if (!date) {
        return false;
      }

      if (filters.dateFrom) {
        const from = parseDate(filters.dateFrom);
        if (from && date < from) {
          return false;
        }
      }

      if (filters.dateTo) {
        const to = parseDate(filters.dateTo);
        if (to && date > to) {
          return false;
        }
      }
    }

    return true;
  });
}

function sortByKey(objects, key, numeric = false) {
  return [...objects].sort((a, b) => {
    if (numeric) {
      return Number(a[key] || 0) - Number(b[key] || 0);
    }
    return String(a[key] || "").localeCompare(String(b[key] || ""), "fr", { sensitivity: "base" });
  });
}

export function aggregateDailyByLigne(defects) {
  const map = {};

  defects.forEach((item) => {
    const date = formatDateKey(item.date_detection);
    const ligne = item.ligne || "Sans ligne";
    if (!date) return;
    map[date] = map[date] || { date };
    map[date][ligne] = (map[date][ligne] || 0) + 1;
  });

  return sortByKey(Object.values(map), "date");
}

export function aggregateWeeklyByBu(defects) {
  const map = {};

  defects.forEach((item) => {
    const semaine = item.semaine ?? "Sans semaine";
    const bu = item.bu || "Sans client";
    map[semaine] = map[semaine] || { semaine };
    map[semaine][bu] = (map[semaine][bu] || 0) + 1;
  });

  return sortByKey(Object.values(map), "semaine", true);
}

export function aggregateMonthlyByBu(defects) {
  const map = {};

  defects.forEach((item) => {
    const mois = formatMonthKey(item.date_detection);
    const bu = item.bu || "Sans client";
    if (!mois) return;
    map[mois] = map[mois] || { mois };
    map[mois][bu] = (map[mois][bu] || 0) + 1;
  });

  return sortByKey(Object.values(map), "mois");
}

export function aggregateByLigne(defects) {
  const map = {};

  defects.forEach((item) => {
    const ligne = item.ligne || "Sans ligne";
    map[ligne] = (map[ligne] || 0) + 1;
  });

  return sortByKey(
    Object.entries(map).map(([ligne, total]) => ({ ligne, total })),
    "ligne"
  );
}

export function aggregateByPoste(defects) {
  const map = {};

  defects.forEach((item) => {
    const poste = item.poste || "Sans poste";
    map[poste] = (map[poste] || 0) + 1;
  });

  return sortByKey(
    Object.entries(map).map(([poste, total]) => ({ poste, total })),
    "poste"
  );
}

export function aggregateByOperator(defects, operatorField, matField = "mat", nameField = operatorField) {
  const map = {};

  defects.forEach((item) => {
    const operator = item[operatorField] || "Sans opérateur";
    const matValue = item[matField] || item.mat || "";
    const nameValue = item[nameField] || operator;
    const bu = item.bu || "Sans client";

    map[operator] = map[operator] || {
      operatrice: operator,
      mat: matValue,
      name: nameValue,
    };

    map[operator][bu] = (map[operator][bu] || 0) + 1;
  });

  return sortByKey(Object.values(map), "operatrice");
}
