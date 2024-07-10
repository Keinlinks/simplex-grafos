import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IntParsePipe } from '../../pipes/intParse.pipe';

@Component({
  selector: 'app-table-data',
  standalone: true,
  imports: [
    CommonModule,
    IntParsePipe
  ],
  templateUrl: `./table_data.component.html`,
  styleUrl: './table_data.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDataComponent {
  @Input() data:any[][] = [[]]
}
