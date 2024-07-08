import { CommonModule } from '@angular/common';
import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
        (change)="valueChangeInput($event)"
        #variable_input
        id="variable_input"
        appNoNumbers
        class="outline-none w-6 text-gray-700 bg-none"
        type="text"
        placeholder="X"
        [disabled]="disabled"
      />
    </div>
  `,
  styleUrl: './eq-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EqInputComponent implements  OnInit,OnChanges {
  @ViewChild('variable_input') variable_input!: ElementRef;
  @Output() valueChange = new EventEmitter<Eq_input>();
  @Input() eq_id: number = 1;
  @Input() variable: string | null = null;
  @Input() disabled: boolean = false;
  @Input() coefficient: number | undefined = 0;
  @Input() input_id: number = 0;
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
    };

  }
  ngOnChanges(changes: SimpleChanges): void {
     if (changes['variable']) {
       const currentValue = changes['variable'].currentValue;
       if (this.values == undefined) return;
       this.values.variable = currentValue;
     }
  }
}
