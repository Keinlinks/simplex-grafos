import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { EqInputComponent } from './components/eq-input/eq-input.component';
import { CommonModule } from '@angular/common';
import { Eq_input, Sign } from './models/Eq_input';
import { EqSignInputComponent } from './components/eq_sign_input/eq_sign_input.component';
import { SimplexLogicService } from './services/simplex-logic.service';
import { TableDataComponent } from './components/table_data/table_data.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    EqInputComponent,
    CommonModule,
    EqSignInputComponent,
    TableDataComponent,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
     this.addVariable(2);
     this.addVariable(4);
     this.addVariable(9);
     this.addVariable(3);
     this.addVariable(1);
     this.addVariable(3);
     this.addVariable(2);

     this.addSubjectTo([1,1,1,0,0,0,0,50],Sign.EQUAL);
     this.addSubjectTo([-1, 0, 0, 1, 0, 0, 0, 40], Sign.EQUAL);
     this.addSubjectTo([0, -1, 0, -1, 1, 0, 0, 0], Sign.EQUAL);
     this.addSubjectTo([0, 0, 1, 0, 0, -1, 1, 30], Sign.EQUAL);
     this.addSubjectTo([0, 0, 0, 0, 1, 1, -1, 60], Sign.EQUAL);

     this.addSubjectTo([1, 0, 0, 0, 0, 0, 0, 10], Sign.LESS_EQUAL);
     this.addSubjectTo([0, 0, 0, 0, 1, 0, 0, 80], Sign.LESS_EQUAL);

    //  this.addVariable(4);
    //  this.addVariable(2);

    //  this.addSubjectTo([5, 15, 50], Sign.GREATER_EQUAL);
    //  this.addSubjectTo([20, 5, 40], Sign.GREATER_EQUAL);
    //  this.addSubjectTo([15, 2, 60], Sign.LESS_EQUAL);
  }
  simplexService = inject(SimplexLogicService);
  cd = inject(ChangeDetectorRef);
  iterations = 5;
  table_data: Map<string, any[][]> = new Map<string, any[][]>();
  equations: Map<number, Eq_input[]> = new Map<number, Eq_input[]>();

  addVariable(coefficient: number = 0) {
    if (this.equations.get(1) == null) {
      this.equations.set(1, [
        {
          variable: 'X1',
          coefficient: coefficient,
          eq_id: 1,
          input_id: 1,
        },
      ]);
    } else {
      let prev = this.equations.get(1);
      if (prev)
        this.equations.set(1, [
          ...prev,
          {
            variable: 'X' + (prev.length + 1).toString(),
            coefficient: coefficient,
            eq_id: 1,
            input_id: prev.length + 1,
          },
        ]);
    }
    let objective = this.equations.get(1);
    if (objective) this.equations.set(1, objective);
    this.cd.detectChanges();
  }

  changeValueInput(event: Eq_input) {
    const eq = this.equations.get(event.eq_id);

    if (!eq) return;
    const index = eq.findIndex((x) => {
      return x.input_id == event.input_id;
    });

    eq[index] = { ...event, sign: eq[index].sign };

    this.changeVariablesName();
    let objective = this.equations.get(1);
    if (objective) this.equations.set(1, objective);
    this.cd.detectChanges();
  }

  changeVariablesName() {
    let variables = this.equations.get(1)?.map((x) => {
      return x.variable;
    });

    if (!variables) return;
    this.equations.forEach((x, index) => {
      if (index == 1) return;
      x.forEach((y, index_2) => {
        if (index_2 == x.length - 1) {
          y.variable = 'C';
        } else {
          y.variable = variables[index_2];
        }
      });
    });
  }

  getVariables() {
    return this.equations.get(1)?.map((x) => x.variable);
  }

  addSubjectTo(coefficient: number[] = [], sign: Sign = Sign.EQUAL) {
    const variables = this.equations.get(1)?.map((x) => {
      return x.variable;
    });
    const subject_count = this.equations.size;
    if (!variables || variables?.length == 0) return;
    let newSubject: Eq_input[] = variables.map((x, index) => {
      return {
        variable: x,
        coefficient: coefficient[index] || 0,
        eq_id: subject_count + 1,
        input_id: subject_count * variables.length + index + 1000,
        sign: sign,
      };
    });
    newSubject.push({
      variable: 'C',
      coefficient: coefficient[coefficient.length - 1] || 0,
      eq_id: subject_count + 1,
      input_id: subject_count + 1 + 2000,
      sign: sign,
    });
    this.equations.set(subject_count + 1, newSubject);
  }
  get valuesArray() {
    return Array.from(this.equations.values());
  }
  get table_d(){
    return Array.from(this.table_data.values());
  }
  reset() {
    this.equations.clear();
    this.simplexService.reset();
    this.table_data.clear();
  }
  calculate() {
    let newMap = new Map<number, Eq_input[]>(this.equations);
    this.table_data =
      this.simplexService.solve(newMap,this.iterations) || new Map<string, any[][]>();
    console.log(this.table_data);

  }

  changeSign(event: any, id: number) {
    this.equations.get(id)?.forEach((x) => {
      x.sign = event;
    });
  }
}
