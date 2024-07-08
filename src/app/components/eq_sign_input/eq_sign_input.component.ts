import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eq-sign-input',
  standalone: true,
  imports: [CommonModule,FormsModule],
  template: `<div
    class="flex border-red border-2 rounded-lg w-24 px-2 py-2 align-middle justify-center"
  >
    <div class="w-14">
      <select
        [(ngModel)]="value"
        value = "0"
        class="w-full outline-none border-none appearance-none"
      >
        <option value="0">=</option>
        <option value="1">>=</option>
        <option value="2"><=</option>
        <option value="3"><</option>
        <option value="4">></option>
      </select>
    </div>
  </div>`,
  styleUrl: './eq_sign_input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EqSignInputComponent {
  value = '0';
}
