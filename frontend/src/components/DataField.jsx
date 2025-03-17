import { useEffect, useState } from "react";
import "../styles/DataField.css";

function DataField({ name, data }) {
  const [highlight, setHighlight] = useState(false);

  // Detecta si el dato cambió y activa el resaltado temporal
  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 800);

    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className={`data_field_container ${highlight ? "highlight" : ""}`}>
      <h3>{name}</h3>
      <p>{data}</p>
    </div>
  );
}

export default DataField;
