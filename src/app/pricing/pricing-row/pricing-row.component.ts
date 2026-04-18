import { Component, input } from '@angular/core';
import { Row } from '../pricing.types';
import { PricingCellComponent } from '../pricing-cell/pricing-cell.component';

@Component({
  selector: 'app-pricing-row',
  standalone: true,
  imports: [PricingCellComponent],
  template: `
    <div class="row-container">
      <div class="row-label">{{ row().label }}</div>
      <div class="row-cells">
        @for (cell of row().prices; track $index) {
          <div class="cell-wrapper">
            <app-pricing-cell [cell]="cell" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .row-container {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 4px 0;
    }
    .row-label {
      min-width: 90px;
      font-size: 13px;
      font-weight: 600;
      color: #495057;
      font-family: 'Inter', sans-serif;
      padding-right: 12px;
      white-space: nowrap;
    }
    .row-cells {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
    }
    .cell-wrapper {
      flex-shrink: 0;
    }
  `],
})
export class PricingRowComponent {
  row = input.required<Row>();
}
