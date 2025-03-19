""" 
Simulación de una Unidad Aritmético-Lógica (ALU), una Unidad de Control (CU) y una Memoria (MEM). 
Este código representa componentes básicos de una arquitectura de computadora en un nivel simplificado.

- ALU: Realiza operaciones aritméticas (suma) y maneja un registro acumulador.
- CU: Controla la ejecución de instrucciones, incluyendo su decodificación e incremento del contador de programa.
- MEM: Simula una memoria con direcciones y valores binarios almacenados.

Cada clase cuenta con métodos para ejecutar sus respectivas funciones dentro del sistema.
"""

class ALU:
  """Unidad Aritmético-Lógica que maneja operaciones aritméticas básicas."""
  def __init__(self):
    self.accumulator = '00000000'
    self.i_registry = '00000000'

  def addition(self):
    """Realiza la suma del acumulador y el registro intermedio."""
    acumulator = int(self.accumulator,2)
    i_registry = int(self.i_registry,2)
    result = (acumulator + i_registry) % 256
    self.accumulator = format(result,'08b')
    return None
  
  def reset(self):
    """Reinicia los registros de la ALU a cero."""
    self.accumulator = '00000000'
    self.i_registry = '00000000'
    return None


class CU():
  """Unidad de Control que maneja la ejecución de instrucciones."""
  def __init__(self):
    self.counter = '0000'
    self.instructions_registry = ''
    self.operation = ''

  def decoder(self, instruction):
    """Decodifica la instrucción dada y determina la operación a realizar."""

    table = {
        '0000':'+',
        '0110':'M',
        '0111':'...'
    }
    self.operation = table[instruction[:4]]
    return instruction[4:]

  def increment(self):
      """Incrementa el contador de programa (manteniéndolo en 4 bits)."""
      number = (int(self.counter, 2) + 1) % 16  # Incrementa y mantiene 4 bits (0-15)
      self.counter = format(number, '04b')
      return None

  def reset(self):
    self.counter = '0000'
    self.instructions_registry = ''
    self.operation = ''
    return None

class MEM():
  """Simulación de una memoria con direcciones y datos."""
  def __init__(self):
    self.dir_registry = ''
    self.data_registry = ''
    self.memory_table = {
        '0000':'00000100',
        '0001':'00000101',
        '0010':'01100111',
        '0011':'01110000',
        '0100':'00001001',
        '0101':'00010100',
        '0110':'00000000',
        '0111':'00000000',
    }
  
  def reset(self):
    self.dir_registry = ''
    self.data_registry = ''
    self.memory_table = {
        '0000':'00000100',
        '0001':'00000101',
        '0010':'01100111',
        '0011':'01110000',
        '0100':'00001001',
        '0101':'00010100',
        '0110':'00000000',
        '0111':'00000000',
    }
    return None
