import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sign } from '../../models/Eq_input';

@Component({
  selector: 'app-eq-sign-input',
  standalone: true,
  imports: [CommonModule,FormsModule],
  template: `<div
    class="flex border-red border-2 rounded-lg w-24 px-2 py-2 align-middle justify-center"
  >
    <div class="w-14">
      <select
      (ngModelChange)="changeValue($event)"
        [(ngModel)]="value"
        value = "0"
        class="w-full outline-none border-none appearance-none"
      >
        <option value="=">=</option>
        <option value=">=">>=</option>
        <option value="<="><=</option>
        <option value="<"><</option>
        <option value=">">></option>
      </select>
    </div>
  </div>`,
  styleUrl: './eq_sign_input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EqSignInputComponent {
  @Input() value:Sign = Sign.EQUAL;
  @Output() valueChange = new EventEmitter<Sign>();

  constructor() {}

  changeValue(event: any) {
    this.valueChange.emit(event);
  }
}
