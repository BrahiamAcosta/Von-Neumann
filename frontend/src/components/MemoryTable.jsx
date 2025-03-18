import { useEffect, useState } from "react";
import "../styles/MemoryTable.css";

function MemoryTable({ memory }) {
  const [previousMemory, setPreviousMemory] = useState([]);

  const [highlightedCells, setHighlightedCells] = useState({});

  useEffect(() => {
    const newHighlights = {};

    memory.forEach(([key, value], index) => {
      const prevValue = previousMemory[index]?.[1];

      if (value !== prevValue) {
        newHighlights[key] = true;

        setTimeout(() => {
          setHighlightedCells((prev) => ({ ...prev, [key]: false }));
        }, 800);
      }
    });

    setHighlightedCells((prev) => ({ ...prev, ...newHighlights }));
    setPreviousMemory(memory);
  }, [memory]);

  return (
    <div className="memory_table">
      <table>
        <thead>
          <tr>
            <th>Dirección</th>
            <th>Contenido</th>
          </tr>
        </thead>
        <tbody>
          {memory.map(([key, value], index) => (
            <tr key={index}>
              <td>{key}</td>
              <td className={highlightedCells[key] ? "highlight" : ""}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MemoryTable;
