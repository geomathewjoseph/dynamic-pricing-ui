import { Component, input } from '@angular/core';
import { Cell, CellValue } from '../pricing.types';
import { WritableSignal } from '@angular/core';

@Component({
  selector: 'app-pricing-cell',
  standalone: true,
  template: `
    @if (cell().editable) {
      <input
        type="text"
        class="cell-input"
        [value]="cell().value()"
        (input)="handleInput(cell().value, $event)"
      />
    } @else {
      <span class="sentinel-cell">{{ cell().value() }}</span>
    }
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    .cell-input {
      width: 72px;
      padding: 8px 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      text-align: center;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .cell-input:focus {
      border-color: #3b5998;
      box-shadow: 0 0 0 3px rgba(59, 89, 152, 0.12);
    }
    .cell-input:hover {
      border-color: #9ca3af;
    }
    .sentinel-cell {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      padding: 8px 10px;
      background: linear-gradient(135deg, #f1f3f5, #e9ecef);
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Inter', sans-serif;
      font-style: italic;
      font-weight: 500;
      color: #868e96;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: not-allowed;
      user-select: none;
    }
  `],
})
export class PricingCellComponent {
  cell = input.required<Cell>();

  handleInput(cellSignal: WritableSignal<CellValue>, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const num = parseFloat(raw);
    cellSignal.set(isNaN(num) ? 0 : num);
  }
}
