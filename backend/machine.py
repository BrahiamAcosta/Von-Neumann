class ALU():

  def __init__(self):
    self.accumulator = '00000000'
    self.i_registry = '00000000'

  def addition(self):
    acumulator = int(self.accumulator,2)
    i_registry = int(self.i_registry,2)
    result = (acumulator + i_registry) % 256
    self.accumulator = format(result,'08b')
    return None
  
  def reset(self):
    self.accumulator = '00000000'
    self.i_registry = '00000000'
    return None


class CU():
  def __init__(self):
    self.counter = '0000'
    self.instructions_registry = ''
    self.operation = ''

  def decoder(self, instruction):
    table = {
        '0000':'+',
        '0110':'M',
        '0111':'...'
    }
    self.operation = table[instruction[:4]]
    return instruction[4:]

  def increment(self):
      number = (int(self.counter, 2) + 1) % 16  # Incrementa y mantiene 4 bits (0-15)
      self.counter = format(number, '04b')
      return None

  def reset(self):
    self.counter = '0000'
    self.instructions_registry = ''
    self.operation = ''
    return None

class MEM():
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
