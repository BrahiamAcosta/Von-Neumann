from fastapi import FastAPI
from pydantic import BaseModel
from machine import ALU, CU, MEM
from fastapi.middleware.cors import CORSMiddleware
from pipeline_machine import PipelineProcessor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  
)

alu = ALU()
cu = CU()
mem = MEM()
pipeline_processor = PipelineProcessor()

total_cycles = 0
total_instructions = 0

class StepRequest(BaseModel):
    step: int


@app.get("/")
def read_root():
    return {"message": "¡Servidor en funcionamiento!"}

@app.get("/init")
def initial_values():
   global total_cycles, total_instructions
   total_cycles = 0
   total_instructions = 0
   return {
      "status": "ok",
        "alu": {
            "accumulator": alu.accumulator,
            "i_registry": alu.i_registry
        },
        "cu": {
            "counter": cu.counter,
            "instructions_registry": cu.instructions_registry,
            "operation": cu.operation
        },
        "mem": {
           "dir_registry": mem.dir_registry,
           "data_registry": mem.data_registry,
           "memory": mem.memory_table
        },
        "stats": {
            "cycles": total_cycles,
            "instructions": total_instructions,
            "cpi": 0
        }
   }

@app.get("/reset")
def reset():
    global total_cycles, total_instructions
    alu.reset()
    cu.reset()
    mem.reset()
    total_cycles = 0
    total_instructions = 0
    return {
        "status": "ok",
        "alu": {
            "accumulator": alu.accumulator,
            "i_registry": alu.i_registry
        },
        "cu": {
            "counter": cu.counter,
            "instructions_registry": cu.instructions_registry,
            "operation": cu.operation
        },
        "mem": {
           "dir_registry": mem.dir_registry,
           "data_registry": mem.data_registry,
           "memory": mem.memory_table
        },
        "stats": {
            "cycles": total_cycles,
            "instructions": total_instructions,
            "cpi": 0
        }
    }

@app.get("/step")
def execute_step():
    global total_cycles, total_instructions
    step_logs = []
    cycle_count = 0
    if cu.operation == "...":
        return {"status": "finished", "memory": mem.memory_table, "stats": {
                "cycles": total_cycles,
                "instructions": total_instructions,
                "cpi": 0 if total_instructions == 0 else total_cycles / total_instructions
            }}
    

    #Fetch
    mem.dir_registry = cu.counter
    step_logs.append({"message": "Contador a registro de direcciones", "mem":{"dir_registry": mem.dir_registry}})
    cycle_count += 1
    
    cu.increment()
    step_logs.append({"message": "Incremento del contador", "cu": {"counter": cu.counter}})
    cycle_count += 1
    
    mem.data_registry = mem.memory_table[mem.dir_registry]
    step_logs.append({"message": "Memoria a registro de datos", "mem": {"data_registry": mem.data_registry}})
    cycle_count += 1
    
    cu.instructions_registry = mem.data_registry
    step_logs.append({"message": "Registro de datos a registro de instrucciones", "cu": {"instructions_registry": cu.instructions_registry}})


    #Decode
    mem.dir_registry = cu.decoder(cu.instructions_registry)
    step_logs.append({"message": "Decodificación de instrucción", "cu": {"operation": cu.operation}})
    step_logs.append({"message": "Registro de instrucciones a registro de direcciones", "mem": {"dir_registry": mem.dir_registry}})
    cycle_count += 1
    
    #Execute
    if cu.operation == '+':
      mem.data_registry = mem.memory_table[mem.dir_registry]
      step_logs.append({"message": "Memoria a registro de datos", "mem": {"data_registry": mem.data_registry}})
      cycle_count += 1
      alu.i_registry = mem.data_registry
      step_logs.append({"message": "Registro de datos a registro de entrada", "alu": {"i_registry": alu.i_registry}})
      cycle_count += 1
      alu.addition()
      step_logs.append({"message": "Suma", "alu":{"accumulator": alu.accumulator}})
      cycle_count += 1
    elif cu.operation == 'M':
      mem.data_registry = alu.accumulator
      step_logs.append({"message": "Acumulador a Registro de datos","mem":{"data_registry": mem.data_registry}})
      cycle_count += 1
      mem.memory_table[mem.dir_registry] = mem.data_registry
      step_logs.append({"message": "Registro de datos a memoria", "mem":{"memory": mem.memory_table}})
      cycle_count += 1
    total_cycles += cycle_count
    total_instructions += 1  
    return {
        "status": "ok",
        "alu": {
            "accumulator": alu.accumulator,
            "i_registry": alu.i_registry
        },
        "cu": {
            "counter": cu.counter,
            "instructions_registry": cu.instructions_registry,
            "operation": cu.operation
        },
        "mem": {
           "dir_registry": mem.dir_registry,
           "data_registry": mem.data_registry,
           "memory": mem.memory_table
        },
        "step_logs":step_logs,
        "stats": {
            "cycles": total_cycles,
            "instructions": total_instructions,
            "cpi": total_cycles / total_instructions,
            "current_cycles": cycle_count
        }
    }

@app.get("/pipeline-step")
def execute_pipeline_step():
    result = pipeline_processor.execute_pipeline_step()
    if result["finished"]:
        return {
            "status": "finished",
            "stats": result["stats"]
        }
    return {
        "status": "ok",
        "pipeline_state": result["state"],
        "step_logs": result["logs"],
        "stats": result["stats"]
    }

@app.get("/pipeline-reset")
def reset_pipeline():
    pipeline_processor.reset()
    return {
        "status": "ok",
        "pipeline_state": {
            "accumulator": pipeline_processor.accumulator,
            "pc": pipeline_processor.pc,
            "memory": pipeline_processor.memory,
            "pipeline_state": pipeline_processor.stages
        }
    }