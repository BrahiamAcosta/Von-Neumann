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
    if cu.operation == "...":
        return {"status": "finished", "memory": mem.memory_table}
    mem.dir_registry = cu.counter
    cu.increment()
    mem.data_registry = mem.memory_table[mem.dir_registry]
    cu.instructions_registry = mem.data_registry
    mem.dir_registry = cu.decoder(cu.instructions_registry)

    if cu.operation == '+':
      mem.data_registry = mem.memory_table[mem.dir_registry]
      alu.i_registry = mem.data_registry
      alu.addition()
    
    elif cu.operation == 'M':
      mem.data_registry = alu.accumulator
      mem.memory_table[mem.dir_registry] = mem.data_registry

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