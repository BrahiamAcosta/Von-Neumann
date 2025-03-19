"""
PipelineProcessor

Este módulo implementa un procesador de pipeline de tres etapas: Fetch, Decode y Execute.
Cada ciclo, el procesador intenta buscar, decodificar y ejecutar instrucciones almacenadas en la memoria.
Las instrucciones están representadas en binario y se componen de un opcode (4 bits) y un operando (4 bits).

Estructura del pipeline:
- Fetch: Obtiene la instrucción de la memoria basada en el contador de programa (PC).
- Decode: Decodifica la instrucción y determina la operación a realizar.
- Execute: Ejecuta la instrucción en el acumulador o en la memoria.

El pipeline maneja un conjunto de registros internos y cuenta los ciclos de ejecución.
"""

class PipelineProcessor:
    def __init__(self):
        """Inicializa el procesador con un pipeline vacío, memoria predefinida y registros en cero."""
        self.stages = {
            'fetch': {'busy': False, 'instruction': None},
            'decode': {'busy': False, 'instruction': None},
            'execute': {'busy': False, 'instruction': None}
        }
        self.memory = {
            '0000':'00000100',
            '0001':'00000101',
            '0010':'01100111',
            '0011':'01110000',
            '0100':'00001001',
            '0101':'00010100',
            '0110':'00000000',
            '0111':'00000000',
        }
        self.pc = '0000'
        self.accumulator = '00000000'
        self.pipeline_cycles = 0
        self.executed_instructions = 0
        self.last_instruction = None
        
    def decode_instruction(self, instruction):
        """Decodifica una instrucción en su operación y operando correspondiente."""
    
        if not instruction:
            return None
        op_code = instruction[:4]
        operand = instruction[4:]
        operations = {
            '0000': ('+', operand),
            '0110': ('M', operand),
            '0111': ('...', operand)
        }
        return operations.get(op_code)

    def execute_pipeline_step(self):
        """Ejecuta un paso del pipeline y retorna el estado del procesador."""
        logs = []
        base_cycle_cost = 1
        
        # Execute stage
        if self.stages['execute']['busy']:
            self.pipeline_cycles += base_cycle_cost
            instruction = self.stages['execute']['instruction']
            if instruction[0] == '+':
                value = int(self.memory[instruction[1]], 2)
                acc = int(self.accumulator, 2)
                self.accumulator = format((acc + value) % 256, '08b')
                logs.append({"stage": "execute", "message": f"Addition completed: {acc} + {value}"})
            elif instruction[0] == 'M':
                self.memory[instruction[1]] = self.accumulator
                logs.append({"stage": "execute", "message": f"Memory store completed: stored {self.accumulator} at {instruction[1]}"})
            elif instruction[0] == '...':
                logs.append({"stage": "execute", "message": "Halt instruction detected"})
                
            self.stages['execute']['busy'] = False
            self.executed_instructions += 1
            self.last_instruction = instruction[0]

        # Decode stage
        if self.stages['decode']['busy']:
            self.pipeline_cycles += base_cycle_cost  # Incrementamos ciclos en decode
            decoded = self.decode_instruction(self.stages['decode']['instruction'])
            if decoded:
                self.stages['execute']['instruction'] = decoded
                self.stages['execute']['busy'] = True
                logs.append({"stage": "decode", "message": f"Decoded {decoded[0]} with operand {decoded[1]}"})
            self.stages['decode']['busy'] = False

        # Fetch stage
        if not self.stages['fetch']['busy'] and self.pc in self.memory:
            self.pipeline_cycles += base_cycle_cost  # Incrementamos ciclos en fetch
            instruction = self.memory[self.pc]
            self.stages['decode']['instruction'] = instruction
            self.stages['decode']['busy'] = True
            self.pc = format((int(self.pc, 2) + 1) % 16, '04b')
            logs.append({"stage": "fetch", "message": f"Fetched instruction {instruction}"})

        # Check if finished
        is_finished = (self.last_instruction == '...' or 
                      (not any(stage['busy'] for stage in self.stages.values()) and 
                       self.decode_instruction(self.memory[self.pc]) and 
                       self.decode_instruction(self.memory[self.pc])[0] == '...'))

        return {
            "logs": logs,
            "state": {
                "accumulator": self.accumulator,
                "pc": self.pc,
                "memory": self.memory,
                "pipeline_state": self.stages
            },
            "stats": {
                "cycles": self.pipeline_cycles,
                "instructions": self.executed_instructions,
                "cpi": self.pipeline_cycles / max(1, self.executed_instructions)
            },
            "finished": is_finished
        }

    def reset(self):
        self.__init__()