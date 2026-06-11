import { normalizeSuperviseurValue } from "../constants/lineConfig";

export function isEmptyFilter(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function normalizeFieldValue(fieldKey, value) {
  if (fieldKey === "equipe") {
    return normalizeSuperviseurValue(value);
  }
  return value;
}

export function matchesFilterValue(cellValue, filterValue, filterType = "text", fieldKey) {
  if (isEmptyFilter(filterValue)) {
    return true;
  }

  if (cellValue === undefined || cellValue === null) {
    return false;
  }

  const normalizedFilter = String(filterValue).trim().toLowerCase();
  const normalizedCell = String(normalizeFieldValue(fieldKey, cellValue)).trim().toLowerCase();

  if (filterType === "select") {
    return normalizedCell === normalizedFilter;
  }

  if (filterType === "number") {
    const parsedFilter = Number(String(filterValue).trim());
    const parsedCell = Number(cellValue);

    if (!Number.isNaN(parsedFilter) && !Number.isNaN(parsedCell)) {
      return parsedCell === parsedFilter;
    }

    return normalizedCell.includes(normalizedFilter);
  }

  if (filterType === "date") {
    return normalizedCell.startsWith(String(filterValue).trim());
  }

  return normalizedCell.includes(normalizedFilter);
}
