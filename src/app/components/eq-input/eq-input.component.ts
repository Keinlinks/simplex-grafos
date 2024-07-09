import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component,  EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,  } from '@angular/core';
import { NoNumbersDirective } from '../../directives/no-numbers.directive';
import { Eq_input } from '../../models/Eq_input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eq-input',
  standalone: true,
  imports: [CommonModule, NoNumbersDirective, FormsModule],
  template: `
    <div
      class="flex border-red border-2 rounded-lg w-24 px-2 py-2 align-middle justify-center"
    >
      <div class="w-14">
        <input
          [disabled]="disabled_input"
          [(ngModel)]="values.coefficient"
          placeholder="0"
          (change)="valueChangeInput($event)"
          class="w-full outline-none appearance-auto"
          type="number"
        />
      </div>
      <div class="w-1 border-r-2 border-gray-400 mx-1"></div>
      <input
        [(ngModel)]="values.variable"
        *ngIf="!variable_2"
        (change)="valueChangeInput($event)"
        #variable_input
        id="variable_input"
        appNoNumbers
        class="outline-none w-6 text-gray-700 bg-none"
        type="text"
        placeholder="X"
        [disabled]="disabled"
      />
      <input
        [title]="values.variable + '_' + values.variable_2"
        *ngIf="variable_2"
        [value]="values.variable + '_' + values.variable_2"
        appNoNumbers
        class="outline-none text-xs w-6 text-gray-700 bg-none"
        type="text"
        placeholder=""
        [disabled]="true"
      />
    </div>
  `,
  styleUrl: './eq-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EqInputComponent implements OnInit, OnChanges {
  @Output() valueChange = new EventEmitter<Eq_input>();
  @Input() eq_id: number = 1;
  @Input() variable: string | null = null;
  @Input() disabled: boolean = false;
  @Input() variable_2: string | undefined = undefined;
  @Input() coefficient: number | undefined = 0;
  @Input() input_id: number = 0;
  disabled_input: boolean = false;
  values!: Eq_input;
  valueChangeInput(event: any) {
    this.valueChange.emit(this.values);
  }

  ngOnInit(): void {
    this.values = {
      eq_id: this.eq_id,
      variable: this.variable || '',
      coefficient: this.coefficient,
      input_id: this.input_id,
      variable_2: this.variable_2,
    };

    if (this.variable_2) {
      this.disabled = true;
      this.disabled_input = true;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['variable']) {
      const currentValue = changes['variable'].currentValue;
      if (this.values == undefined) return;
      this.values.variable = currentValue;
    }
  }
}
