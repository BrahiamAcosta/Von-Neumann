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
  const [pipelineState, setPipelineState] = useState(null);

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

  const pipelineStep = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/${data.status === "initial" ? "pipeline-reset" : "pipeline-step"}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const newState = await response.json();
      if (newState.status === "finished") {
        setData({...data, status: "finished", stats: newState.stats});
      } else {
        setPipelineState(newState.pipeline_state);
        // Actualizar el estado de la memoria
        setData(prevData => ({
          ...prevData,
          mem: {
            ...prevData.mem,
            memory: newState.pipeline_state.memory
          },
          alu: {
            ...prevData.alu,
            accumulator: newState.pipeline_state.accumulator
          }
        }));
        setStepLogs(newState.step_logs || []);
        setCurrentLog(0);
      }
    } catch (error) {
      console.error("Error en pipeline step:", error);
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

  // Modifiqué la función nextLog para manejar tanto el modo normal como el pipeline
  const nextLog = () => {
    if (optimizedSimulator) {
      pipelineStep();
    } else {
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
    }
  };

  const toggleAutoMode = () => {
    setIsAutoMode((prev) => !prev);
  };

  // Modifiqué el useEffect que maneja el autoMode
  useEffect(() => {
    if (isAutoMode) {
      autoModeRef.current = setInterval(nextLog, 1000);
    } else {
      clearInterval(autoModeRef.current);
    }

    return () => clearInterval(autoModeRef.current);
  }, [isAutoMode, currentLog, stepLogs, optimizedSimulator]); // Añadí optimizedSimulator como dependencia

  useEffect(() => {
    if (optimizedSimulator) {
      pipelineStep();
    } else {
      step();
    }
  }, [optimizedSimulator]);

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
          <div className="metrics-container">
            <h3>Métricas de rendimiento</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Ciclos totales:</span>
                <span className="metric-value">{data.stats?.cycles || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Instrucciones ejecutadas:</span>
                <span className="metric-value">{data.stats?.instructions || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">CPI (Ciclos por instrucción):</span>
                <span className="metric-value">{data.stats?.cpi ? data.stats.cpi.toFixed(2) : "0"}</span>
              </div>
            </div>
          </div>
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
            {optimizedSimulator && pipelineState && (
              <div className="pipeline-view">
                <h3>Pipeline Status</h3>
                <div className="pipeline-stages">
                  {Object.entries(pipelineState.pipeline_state).map(([stage, info]) => (
                    <div key={stage} className="pipeline-stage">
                      <h4>{stage.toUpperCase()}</h4>
                      <p>Status: {info.busy ? "Busy" : "Free"}</p>
                      {info.instruction && <p>Instruction: {info.instruction}</p>}
                    </div>
                  ))}
                </div>
                <div className="pipeline-state">
                  <p>PC: {pipelineState.pc}</p>
                  <p>Accumulator: {pipelineState.accumulator}</p>
                </div>
              </div>
            )}
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
            {!isAutoMode && (
              <button onClick={nextLog}>
                {optimizedSimulator ? "Ejecutar Pipeline" : "Ejecutar Paso"}
              </button>
            )}
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
