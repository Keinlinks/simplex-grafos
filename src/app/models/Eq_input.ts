export interface Eq {
  eq_input: Eq_input[];
}

export interface Eq_input {
  variable: string;
  coefficient?: number;
  variable_2?: string;
  eq_id: number;
  input_id: number;
  sign?: Sign;
}


export enum Sign {
  EQUAL = '=',
  GREATER = '>',
  LESS = '<',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
}
