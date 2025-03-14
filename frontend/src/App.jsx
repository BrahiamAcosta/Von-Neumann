import { useEffect, useState } from "react";
import MemoryTable from "./components/MemoryTable";
import DataField from "./components/DataField";
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
            <div className="component_box">
              <div className="component_box_header">
                <h2>Unidad de Control (CU)</h2>
              </div>
              <div className="component_box_content">
                <DataField name="Contador: " data={data.cu.counter} />
                <DataField
                  name="Registro de Instrucciones:"
                  data={data.cu.instructions_registry}
                />
                <DataField name="Operación: " data={data.cu.operation} />
              </div>
            </div>

            <div className="component_box">
              <div className="component_box_header">
                <h2>Memoria (MEM)</h2>
              </div>
              <div className="component_box_content">
                <DataField
                  name="Registro de Dirección: "
                  data={data.mem.dir_registry}
                />
                <MemoryTable memory={Object.entries(data.mem.memory)} />
                <DataField
                  name="Registro de Datos: "
                  data={data.mem.data_registry}
                />
              </div>
            </div>

            <div className="component_box">
              <div className="component_box_header">
                <h2>Unidad Aritmético-Lógica (ALU)</h2>
              </div>
              <div className="component_box_content">
                <DataField name="Acumulador: " data={data.alu.accumulator} />
                <DataField
                  name="Registro de Instrucción: "
                  data={data.alu.i_registry}
                />
              </div>
            </div>
          </div>

          <button onClick={step}>Ejecutar Paso</button>
        </>
      )}
    </div>
  );
}

export default App;
