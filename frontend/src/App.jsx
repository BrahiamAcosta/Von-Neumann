import { useEffect, useState, useRef } from "react";
import MemoryTable from "./components/MemoryTable";
import DataField from "./components/DataField";
import "./App.css";

function App() {
  const [data, setData] = useState({ status: "initial" });
  const [stepLogs, setStepLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState(0);
  const [optimizedSimulator, setOptimizedSimulator] = useState("no_choice");
  const [isAutoMode, setIsAutoMode] = useState(false);
  const autoModeRef = useRef(null);

  const step = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/${data.status === "initial" ? "init" : "step"}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const newState = await response.json();

      if (data.status === "initial" || newState.status === "finished") {
        setData(newState);
      }
      setStepLogs(newState.step_logs || []);
      setCurrentLog(0);
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

  const nextLog = () => {
    if (currentLog < stepLogs.length) {
      const log = stepLogs[currentLog];

      setData((prevData) => ({
        ...prevData,
        cu: { ...prevData.cu, ...log.cu },
        alu: { ...prevData.alu, ...log.alu },
        mem: { ...prevData.mem, ...log.mem },
      }));

      setCurrentLog(currentLog + 1);
    } else {
      step();
    }
  };

  const toggleAutoMode = () => {
    setIsAutoMode((prev) => !prev);
  };

  useEffect(() => {
    if (isAutoMode) {
      autoModeRef.current = setInterval(nextLog, 1000);
    } else {
      clearInterval(autoModeRef.current);
    }

    return () => clearInterval(autoModeRef.current);
  }, [isAutoMode, currentLog, stepLogs]);

  useEffect(() => {
    step();
  }, []);

  useEffect(() => {
    if (performance.getEntriesByType("navigation")[0].type === "reload") {
      reset();
    }
  }, []);

  return (
    <div>
      <h1>Máquina de Von Neumann</h1>

      {optimizedSimulator === "no_choice" ? (
        <div>
          <h2>Selecciona el simulador a utilizar</h2>
          <div className="buttons_container">
            <button onClick={() => setOptimizedSimulator(false)}>
              Simulador no optimizado
            </button>
            <button onClick={() => setOptimizedSimulator(true)}>
              Simulador optimizado
            </button>
          </div>
        </div>
      ) : data.status === "initial" ? (
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
                <DataField
                  key={`counter-${data.cu.counter}`}
                  name="Contador: "
                  data={data.cu.counter}
                />
                <DataField
                  key={`instructions-${data.cu.instructions_registry}`}
                  name="Registro de Instrucciones:"
                  data={data.cu.instructions_registry}
                />
                <DataField
                  key={`operation-${data.cu.operation}`}
                  name="Operación: "
                  data={data.cu.operation}
                />
              </div>
            </div>

            <div className="component_box">
              <div className="component_box_header">
                <h2>Memoria (MEM)</h2>
              </div>
              <div className="component_box_content">
                <DataField
                  key={`dir-${data.mem.dir_registry}`}
                  name="Registro de Dirección: "
                  data={data.mem.dir_registry}
                />
                <MemoryTable memory={Object.entries(data.mem.memory)} />
                <DataField
                  key={`data-${data.mem.data_registry}`}
                  name="Registro de Datos: "
                  data={data.mem.data_registry}
                />
              </div>
            </div>
            {optimizedSimulator && <h1>Optimized Simulator selected</h1>}
            <div className="component_box">
              <div className="component_box_header">
                <h2>Unidad Aritmético-Lógica (ALU)</h2>
              </div>
              <div className="component_box_content">
                <DataField
                  key={`i_registry-${data.alu.i_registry}`}
                  name="Registro de Instrucción: "
                  data={data.alu.i_registry}
                />
                <DataField
                  key={`accumulator-${data.alu.accumulator}`}
                  name="Acumulador: "
                  data={data.alu.accumulator}
                />
              </div>
            </div>
          </div>

          <div className="buttons_container">
            {!isAutoMode && <button onClick={nextLog}>Ejecutar Paso</button>}
            <button onClick={toggleAutoMode}>
              {isAutoMode ? "Detener" : "Modo Automático"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
