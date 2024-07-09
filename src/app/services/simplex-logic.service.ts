import { Injectable } from '@angular/core';
import { Eq_input } from '../models/Eq_input';

@Injectable({
  providedIn: 'root',
})
export class SimplexLogicService {
  objective: number[] = [];
  equations: Map<number, Eq_input[]> = new Map<number, Eq_input[]>();
  artificial: number = 0;
  holgura: number = 0;
  tableau: any[][] = [[]];
  constructor() {}

  solve(equations: Map<number, Eq_input[]>) {
    this.equations = equations;
    if (!equations.get(1)) return;
    this.objective = equations.get(1)?.map((x) => x.coefficient || 0) || [];

    for (let i = 1; i <= equations.size; i++) {
      let eq = equations.get(i);
      if (!eq) continue;
      const sign = eq[0].sign?.toString();

      switch (sign) {
        case '=':
          eq.push({
            ...eq[0],
            variable: 'A' + (this.artificial + 1),
            coefficient: -1,
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
  }

  getVariables() {
    return this.equations.get(1)?.map((x) => x.variable) || [];
  }

  generateTableau() {
    this.tableau = new Array(this.holgura + this.artificial + 2)
      .fill(0)
      .map((x) => ['VB']);
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
    let z = this.addM();

    this.tableau[0].forEach((head: any, index: number) => {
      Array.from(this.equations.values()).forEach((eq, i) => {
        let s = eq.find((x) => {
          return x.variable === head;
        });

        if (s) {
          let p: any = s.coefficient;
          if (p != 0) {
            p = p + s.variable_2 || '';
          }
          this.tableau[i + 1].push(
            s.coefficient +
              (s.variable_2 && s.coefficient != 0 ? s.variable_2 : '')
          );
        } else {
          this.tableau[i + 1].push(0);
        }
      });
    });
    this.verifyVB();

    this.iterationSimplex();

    console.log(this.tableau);
  }

  verifyVB() {
    this.tableau.forEach((x, row) => {
      if (row === 0) return;
      x.forEach((y, column) => {
        let label_column = this.tableau[0][column - 1];
        if (label_column === 'C') return;
        const number = Number(y);
        if (isNaN(number)) return;
        let label_row = this.tableau[row][0];

        if (number > 0) {
          this.tableau[row][0] = label_column;
        }
      });
    });
  }
  iterationSimplex() {
    //buscar el más positivo (pivote)
    const index_column = this.searchMorePositive();
    //buscar la Variable de Salida
    const index_row = this.testCoefficient();

    console.log(this.tableau[index_row][index_column]);
  }

  testCoefficient() {
    const index_C = this.tableau[0].length
    let result = 0;
    let pivot_column = 0;
    let pivot_row = 0;
    this.tableau.forEach((row, i) => {
      const C = row[index_C]
      row.forEach((y, j) => {
        if(j === index_C) return;
        const number = Number(y);
        if (isNaN(number)) return;
        if(number !== 0 && Math.abs(C / number) > result) {
          result = Math.abs(C / number);
          pivot_column = j;
          pivot_row = i;
        }
      });
    });
    return pivot_column;
  }

  searchMorePositive() {
    let result = -1;
    let label_column = '';
    let index_column = 0;
    this.tableau[1].forEach((x, i) => {
      if (x > result) {
        result = x;
        label_column = this.tableau[0][i];
        index_column = i;
      }
    });
    if (result == -1) return -1;
    console.log('varialbe de entrada: ', label_column);
    return index_column;
  }

  reset() {
    this.objective = [];
    this.equations.clear();
    this.artificial = 0;
    this.holgura = 0;
  }

  addM() {
    for (let i = 0; i <= this.artificial; i++) {
      this.equations.get(1)?.push({
        variable: 'A' + (i + 1),
        variable_2: 'M',
        coefficient: 1,
        eq_id: 1,
        input_id: i,
      });
    }
    return this.equations.get(1);
  }
}
