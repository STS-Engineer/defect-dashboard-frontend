import {
  BU_COLORS,
  DEFAULT_BADGE_COLOR,
  EQUIPE_COLORS,
  LIGNE_COLORS,
  POSTE_COLORS,
} from "../constants/tableColors";
import { normalizeSuperviseurValue } from "../constants/lineConfig";

const COLOR_MAPS = {
  ligne: LIGNE_COLORS,
  bu: BU_COLORS,
  poste: POSTE_COLORS,
  equipe: EQUIPE_COLORS,
};

export function getBadgeColor(columnKey, value) {
  const normalizedValue = columnKey === "equipe" ? normalizeSuperviseurValue(value) : value;
  return COLOR_MAPS[columnKey]?.[normalizedValue] || LIGNE_COLORS[normalizedValue] || DEFAULT_BADGE_COLOR;
}

export default function ColorBadge({ value, color, columnKey, className = "" }) {
  if (!value && value !== 0) {
    return null;
  }

  const normalizedValue = columnKey === "equipe" ? normalizeSuperviseurValue(value) : value;
  const badgeColor = color || getBadgeColor(columnKey, normalizedValue);

  return (
    <span className={`color-badge ${className}`} style={{ backgroundColor: badgeColor }}>
      {normalizedValue}
    </span>
  );
}
