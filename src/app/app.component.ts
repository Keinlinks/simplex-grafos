import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { EqInputComponent } from './components/eq-input/eq-input.component';
import { CommonModule } from '@angular/common';
import { Eq_input } from './models/Eq_input';
import { EqSignInputComponent } from './components/eq_sign_input/eq_sign_input.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EqInputComponent, CommonModule,EqSignInputComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  cd = inject(ChangeDetectorRef);
  equations: Map<number, Eq_input[]> = new Map<number, Eq_input[]>();

  addVariable() {
    if (this.equations.get(1) == null) {
      this.equations.set(1, [
        {
          variable: 'X0',
          coefficient: 0,
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
            variable: 'X' + prev.length.toString(),
            coefficient: 0,
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

    eq[index] = event;

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
        y.variable = variables[index_2];
      });
    });
  }

  getVariables() {
    return this.equations.get(1)?.map((x) => x.variable);
  }

  addSubjectTo() {
    const variables = this.equations.get(1)?.map((x) => {
      return x.variable;
    });
    const subject_count = this.equations.size;
    if (!variables || variables?.length == 0) return;
    let newSubject = variables.map((x, index) => {
      return {
        variable: x,
        coefficient: 0,
        eq_id: subject_count + 1,
        input_id: subject_count * variables.length + index + 1000,
      };
    });
    this.equations.set(subject_count + 1, newSubject);
  }
  get valuesArray() {
    return Array.from(this.equations.values());
  }
  reset() {
    this.equations.clear();
  }
  calculate(){
    console.log(this.equations)
  };
}
