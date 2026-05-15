import { useState } from "react";
import DefectForm from "../components/DefectForm";
import { FORM_CONFIGS } from "../forms/formConfigs";

export default function FormsPage() {
  const keys = Object.keys(FORM_CONFIGS);
  const [selected, setSelected] = useState(keys[0]);

  return (
    <div>
      <h1>Formulaires</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {keys.map((key) => (
          <button key={key} onClick={() => setSelected(key)}>
            {FORM_CONFIGS[key].title}
          </button>
        ))}
      </div>

      <DefectForm config={FORM_CONFIGS[selected]} />
    </div>
  );
}