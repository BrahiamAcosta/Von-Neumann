import { useEffect, useState } from "react";
import "./App.css";
function App() {
  const [data, setData] = useState({
    alu: {
      accumulator: "",
      i_registry: "",
    },
    cu: {
      counter: "",
      instructions_registry: "",
      operation: "",
    },
    mem: {
      dir_registry: "",
      data_registry: "",
      memory: {},
    },
    status: "initial",
  });

  const step = async () => {
    try {
      const response = await fetch("http://localhost:8000/step");

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const newState = await response.json();

      setData(newState);
    } catch (error) {
      console.error("Error al avanzar el paso:", error);
    }
  };

  useEffect(() => {
    step();
  }, []);
  return (
    <div>
      <h1>Máquina de Von Neumann</h1>

      {data.status === "initial" ? (
        <h2>Cargando...</h2>
      ) : data.status === "finished" ? (
        <h2>Proceso Finalizado</h2>
      ) : (
        <div>
          <h2>Unidad Aritmético-Lógica (ALU)</h2>
          <p>Acumulador: {data.alu.accumulator}</p>
          <p>Registro de Instrucción: {data.alu.i_registry}</p>

          <h2>Unidad de Control (CU)</h2>
          <p>Contador: {data.cu.counter}</p>
          <p>Registro de Instrucciones: {data.cu.instructions_registry}</p>
          <p>Operación: {data.cu.operation}</p>

          <h2>Memoria (MEM)</h2>
          <p>Registro de Dirección: {data.mem.dir_registry}</p>
          <p>Registro de Datos: {data.mem.data_registry}</p>

          <button onClick={step}>Ejecutar Paso</button>
        </div>
      )}
    </div>
  );
}

export default App;
