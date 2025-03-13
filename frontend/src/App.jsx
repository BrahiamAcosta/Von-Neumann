import { useEffect, useState } from "react";
import MemoryTable from "./components/MemoryTable";
import "./App.css";
function App() {
  const [data, setData] = useState({ status: "initial" });

  const step = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/${data.status === "initial" ? "init" : "step"}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const newState = await response.json();

      setData(newState);
    } catch (error) {
      console.error("Error al avanzar el paso:", error);
    }
  };

  const reset = async () => {
    try {
      const request = await fetch("http://localhost:8000/reset");
      if (!request.ok) {
        throw new Error(`Error HTTP: ${request.status}`);
      }
      const newState = await request.json();
      setData(newState);
    } catch (error) {
      console.error("Error al reiniciar el proceso:", error);
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
        <>
          <h2>Proceso Finalizado</h2>
          <button
            onClick={() => {
              setData({
                status: "initial",
              });
              reset();
            }}
          >
            Reiniciar
          </button>
        </>
      ) : (
        <>
          <div className="container">
            <div>
              <h2>Unidad de Control (CU)</h2>
              <div className="component_box">
                <p>Contador: {data.cu.counter}</p>
                <p>
                  Registro de Instrucciones: {data.cu.instructions_registry}
                </p>
                <p>Operación: {data.cu.operation}</p>
              </div>
            </div>

            <div className="component_box">
              <h2>Memoria (MEM)</h2>
              <p>Registro de Dirección: {data.mem.dir_registry}</p>
              <MemoryTable memory={Object.entries(data.mem.memory)} />
              <p>Registro de Datos: {data.mem.data_registry}</p>
            </div>

            <div className="component_box">
              <h2>Unidad Aritmético-Lógica (ALU)</h2>
              <p>Acumulador: {data.alu.accumulator}</p>
              <p>Registro de Instrucción: {data.alu.i_registry}</p>
            </div>
          </div>

          <button onClick={step}>Ejecutar Paso</button>
        </>
      )}
    </div>
  );
}

export default App;
