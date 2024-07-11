import { Injectable } from '@angular/core';
import { Eq_input } from '../models/Eq_input';
import * as math from 'mathjs';
import * as loadash from "lodash";
import * as chalk from 'chalk';
@Injectable({
  providedIn: 'root',
})
export class SimplexLogicService {
  objective: number[] = [];
  equations: Map<number, Eq_input[]> = new Map<number, Eq_input[]>();
  artificial: number = 0;
  holgura: number = 0;
  tableau: any[][] = [[]];

  allTables: Map<string, any[][]> = new Map<string, any[][]>();
  chalkI = new chalk.Chalk();
  timeOut = 25;

  constructor() {}

  solve(equations: Map<number, Eq_input[]>, iterations: number = 25) {
    this.timeOut = iterations;
    this.equations = equations;
    if (!equations.get(1)) return;
    this.objective = equations.get(1)?.map((x) => x.coefficient || 0) || [];
    this.equalToZero();
    for (let i = 1; i <= equations.size; i++) {
      let eq = equations.get(i);
      if (!eq) continue;
      const sign = eq[0].sign?.toString();

      switch (sign) {
        case '=':
          eq.push({
            ...eq[0],
            variable: 'A' + (this.artificial + 1),
            coefficient: 1,
          });
          this.artificial++;
          break;
        case '>=':
          eq.push({
            ...eq[0],
            variable: 'S' + (this.holgura + 1),
            coefficient: -1,
          });
          eq.push({
            ...eq[0],
            variable: 'A' + (this.artificial + 1),
            coefficient: 1,
          });
          this.holgura++;
          this.artificial++;
          break;
        case '<=':
          eq.push({
            ...eq[0],
            variable: 'S' + (this.holgura + 1),
            coefficient: 1,
          });
          this.holgura++;
          break;
      }
    }

    this.generateTableau();
    let copy = loadash.cloneDeep(this.tableau);
    this.allTables.set('tabla inicial', copy);
    this.tableau[1] = this.gauss()[1];


    copy = loadash.cloneDeep(this.tableau);


    this.allTables.set('Tabla Gauss', copy);

    this.iterationSimplex();
    return this.allTables;
  }

  getVariables() {
    return this.equations.get(1)?.map((x) => x.variable) || [];
  }

  generateTableau() {
    const eq_size = this.equations.size;
    this.tableau = new Array(eq_size + 1).fill(0).map((x) => ['VB']);
    this.tableau[0] = ['VB', 'z'];
    this.tableau[1] = ['z'];
    this.getVariables().forEach((x) => {
      this.tableau[0].push(x);
    });
    for (let i = 1; i <= this.holgura; i++) {
      this.tableau[0].push('S' + i);
    }
    for (let i = 1; i <= this.artificial; i++) {
      this.tableau[0].push('A' + i);
    }

    this.tableau[0].push('C');

    this.addM();

    this.tableau[0].forEach((head: any, index: number) => {
      if (index === 0) return;
      Array.from(this.equations.values()).forEach((eq, i) => {
        let s = eq.find((x) => {
          return x.variable === head;
        });
        if (s) {
          let p;

          if (s.variable_2 ){
            p = s.coefficient?.toString() + s.variable_2;
          }
          else{
            p = s.coefficient
          }
          this.tableau[i + 1].push(
            p
          );
        } else {
          if(this.tableau[0][index] == 'z'){

          }
          this.tableau[i + 1].push(0);
        }
      });
    });
    this.verifyVariableBasic();
  }

  verifyVariableBasic() {
    let variables_basic_count = 0;
    let variables_basic: string[] = [];
    this.tableau.forEach((x, row) => {
      if (row === 0 || row == 1) return;
      x.forEach((y, column) => {
        let label_column = this.tableau[0][column];
        if (label_column === 'C') return;
        const number = Number(y);
        if (isNaN(number)) return;
        let label_row = this.tableau[row][0];

        if (number == 1) {
          if (variables_basic.includes(label_column)) return;
          if (!label_column.includes('S') && !label_column.includes('A'))
            return;
          this.tableau[row][0] = label_column;
          variables_basic.push(label_column);
          variables_basic_count++;
        }
      });
    });
  }
  scopeObjetive(mValue: number){
    let scope = { M: mValue };

    this.tableau[1].forEach((x, i) => {
      if (i == 0 ) return;
      this.tableau[1][i] = math.evaluate(`${x}`, scope);
    });
  }
  iterationSimplex() {
    let iteration = 0;
    this.scopeObjetive(1000);
    while (iteration < this.timeOut) {
      //buscar el más positivo (pivote)
      const index_column = this.searchMorePositive();
      //verificar si hay mas positivos
      if (index_column == -1) break;
      //buscar la Variable de Salida
      const index_row = this.testCoefficient(index_column);
      if (index_row == 0) break;
      //reemplazar la variable basica
      this.tableau[index_row][0] = this.tableau[0][index_column];
      //multiplicar la fila del pivote por 1/varialbe_pivote
      console.log(this.chalkI.blue("elemento pivote: ",this.tableau[index_row][index_column]));
      this.multiplyRow(
        index_row,
        `(1 / ${this.tableau[index_row][index_column]})`
      );

      this.columnPivotZero(index_column, index_row);
      iteration++;
      let copy = loadash.cloneDeep(this.tableau);
      this.allTables.set(`Tabla iteracion ${iteration}`, copy);
    }
  }

  multiplyRow(row: number, value: string) {
    this.tableau[row].forEach((x, i) => {
      if (i === 0 || i === 1) return;
      console.log(
        this.chalkI.blue(
          'elemento fila: ',
          `${value} * ${this.tableau[row][i]}`
        )
      );
      this.tableau[row][i] = math.evaluate(
        `${value} * ${this.tableau[row][i]}`
      );
    });
  }

  columnPivotZero(column: number, row_pivot: number) {
    this.tableau.forEach((row_tableau, row) => {
      if (row === 0 || row === row_pivot) return;
      let mult = `(${this.tableau[row][column]}) * -1`;

      let value_to_multiply = this.simplifyExpression(mult);

      if (!value_to_multiply.includes('M'))
        value_to_multiply = math.evaluate(`${value_to_multiply}`);
      if (Number(value_to_multiply) === 0) return;
      this.tableau[row].forEach((value, index) => {
        if (index === 0 || index === 1) return;
        const pivot_column_value = Number(this.tableau[row_pivot][index]);

        let sums = `${this.tableau[row][index]} + (${value_to_multiply} * ${pivot_column_value})`;

        let result = this.simplifyExpression(sums);
        if (!result.includes('M')) result = this.limitDecimalsIfExceeds(math.evaluate(`${result}`),3);
        let out;
        const isNumber = Number(result);
        if (isNaN(isNumber)) out = result;
        else out = Number(result);
        this.tableau[row][index] = out;
      });
    });
  }

  testCoefficient(column: number) {
    const index_C = this.tableau[0].length - 1;
    let result = 999999999999999;
    let pivot_row = 0;
    this.tableau.forEach((row, i) => {
      if (i === 0 || i === 1) return;
      let operation_verify = `(abs((${row[index_C]}) / (${row[column]})) < (${result}))`;
      let operation = `abs((${row[index_C]}) / (${row[column]}))`;
      if (math.evaluate(operation_verify)) {
        result = Number(math.evaluate(operation));
        pivot_row = i;
      }
    });
    console.log(this.chalkI.red(`cociente ganador:  ${this.tableau[pivot_row][0]}`));
    return pivot_row;
  }

  searchMorePositive() {
    let result: any = 0;
    let label_column = '';
    let index_column = 0;
    this.tableau[1].forEach((x, i) => {
      if (i == 0 || this.tableau[0][i].includes('C')) return;
      let isPositive = math.evaluate(`${x} > 0`, { M: 99999999 });
      if (!isPositive) return;
      if (result == undefined) {
        result = x;
        label_column = this.tableau[0][i];
        index_column = i;
        return;
      }
      let greater = math.evaluate(`${x} > ${result}`, { M: 99999999 });
      if (!greater) return;
      result = x;
      label_column = this.tableau[0][i];
      index_column = i;
    });
    if (result == -1 || result == 0) return -1;
    console.log(this.chalkI.green(`tabla:  ${this.allTables.size}`));
    console.log(this.chalkI.green(`Buscando el más positivo:  ${label_column}`));

    return index_column;
  }

  reset() {
    this.objective = [];
    this.equations.clear();
    this.artificial = 0;
    this.holgura = 0;
  }

  gauss() {
    let gaussTableau: any[][] = JSON.parse(JSON.stringify(this.tableau));

    let columns_M: any = gaussTableau[1].map((x, i) => {
      const value = Number(x);
      if (!isNaN(value)) return;
      if (x.includes('M')) return i;
      return;
    });
    columns_M = columns_M.filter((value: any) => value !== undefined);
    let rows_gauss = [];
    for (let i = 0; i < gaussTableau.length; i++) {
      if (i === 0 || i === 1) continue;
      for (let j = 0; j < columns_M.length; j++) {
        let value = gaussTableau[i][columns_M[j]];
        const number = Number(value);
        if (!isNaN(number)) {
          if (number == 1) {
            rows_gauss.push(i);
          }
        }
      }
    }
    let M = 1;
    rows_gauss.forEach((x) => {
      gaussTableau[x].forEach((y, index) => {
        const number = Number(y);
        if (isNaN(number) || number == 0) return;
        gaussTableau[x][index] = number * M + 'M';
        let eq =
        '(' +
        gaussTableau[1][index].toString() +
        ')' +
        '+' +
        '(' +
        gaussTableau[x][index].toString() +
        ')';
        gaussTableau[1][index] = this.simplifyExpression(eq);

      });
    });
    let copy = loadash.cloneDeep(gaussTableau);
    return gaussTableau;
  }
  simplifyExpression(expression: string) {
    const node = math.parse(expression);

    const simplified = math.simplify(node);

    return simplified.toString();
  }
  equalToZero() {
    let objetive = this.equations.get(1);

    objetive?.forEach((x) => {
      if (x.coefficient) x.coefficient = x.coefficient * -1;
    });
  }

  addM() {
    for (let i = 0; i <= this.artificial; i++) {
      this.equations.get(1)?.push({
        variable: 'A' + (i + 1),
        variable_2: 'M',
        coefficient: -1,
        eq_id: 1,
        input_id: i,
      });
    }
    return this.equations.get(1);
  }
  limitDecimalsIfExceeds(value:number, maxDecimals:number) {
    const resultString = math.format(value, {
      notation: 'fixed',
      precision: maxDecimals + 1,
    });

    if (
      resultString.split('.')[1] &&
      resultString.split('.')[1].length > maxDecimals
    ) {
      return math.format(value, { notation: 'fixed', precision: maxDecimals });
    } else {
      return value.toString();
    }
  }

}
