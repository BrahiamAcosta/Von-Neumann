from fastapi import FastAPI
from pydantic import BaseModel
from machine import ALU, CU, MEM
from fastapi.middleware.cors import CORSMiddleware

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


class StepRequest(BaseModel):
    step: int


@app.get("/")
def read_root():
    return {"message": "¡Servidor en funcionamiento!"}

@app.get("/init")
def initial_values():
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
        }
   }

@app.get("/reset")
def reset():
    alu.reset()
    cu.reset()
    mem.reset()
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
        }
    }

@app.get("/step")
def execute_step():
    step_logs = []
    if cu.operation == "...":
        return {"status": "finished", "memory": mem.memory_table}
    

    #Fetch
    mem.dir_registry = cu.counter
    step_logs.append({"message": "Contador a registro de direcciones", "mem":{"dir_registry": mem.dir_registry}})

    cu.increment()
    step_logs.append({"message": "Incremento del contador", "cu": {"counter": cu.counter}})

    mem.data_registry = mem.memory_table[mem.dir_registry]
    step_logs.append({"message": "Memoria a registro de datos", "mem": {"data_registry": mem.data_registry}})

    cu.instructions_registry = mem.data_registry
    step_logs.append({"message": "Registro de datos a registro de instrucciones", "cu": {"instructions_registry": cu.instructions_registry}})


    #Decode
    mem.dir_registry = cu.decoder(cu.instructions_registry)
    step_logs.append({"message": "Decodificación de instrucción", "cu": {"operation": cu.operation}})
    step_logs.append({"message": "Registro de instrucciones a registro de direcciones", "mem": {"dir_registry": mem.dir_registry}})

    #Execute
    if cu.operation == '+':
      mem.data_registry = mem.memory_table[mem.dir_registry]
      step_logs.append({"message": "Memoria a registro de datos", "mem": {"data_registry": mem.data_registry}})

      alu.i_registry = mem.data_registry
      step_logs.append({"message": "Registro de datos a registro de entrada", "alu": {"i_registry": alu.i_registry}})
      
      alu.addition()
      step_logs.append({"message": "Suma", "alu":{"accumulator": alu.accumulator}})
    
    elif cu.operation == 'M':
      mem.data_registry = alu.accumulator
      step_logs.append({"message": "Acumulador a Registro de datos","mem":{"data_registry": mem.data_registry}})

      mem.memory_table[mem.dir_registry] = mem.data_registry
      step_logs.append({"message": "Registro de datos a memoria", "mem":{"memory": mem.memory_table}})
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
    }