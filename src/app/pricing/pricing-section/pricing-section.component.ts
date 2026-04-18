import { Component, input, inject } from '@angular/core';
import { PricingSection, CellValue } from '../pricing.types';
import { PricingStateService } from '../pricing-state.service';
import { PricingRowComponent } from '../pricing-row/pricing-row.component';

@Component({
  selector: 'app-pricing-section',
  standalone: true,
  imports: [PricingRowComponent],
  template: `
    <!-- Collapsible Header -->
    <div class="section-panel">
      <div class="section-header" (click)="toggleExpand()">
        <span class="section-title">{{ section().name }}</span>
        <span class="section-toggle">
          {{ section().isExpanded() ? '−' : '+' }}
        </span>
      </div>

      @if (section().isExpanded()) {
        <div class="section-body animate-in">
          <!-- Add Column Button -->
          <button class="add-column-btn" (click)="onAddColumn()">
            + Add Column
          </button>

          <!-- Scrollable Table Container -->
          <div class="table-scroll-container">
            <!-- Tier Header Row -->
            <div class="tier-header-row">
              <div class="row-label-spacer"></div>
              <div class="tier-headers">
                @for (tier of section().tiers(); track $index) {
                  <div class="tier-header">
                    <button
                      class="remove-col-btn"
                      (click)="onRemoveColumn($index)"
                      [disabled]="section().tiers().length <= 1"
                      title="Remove column"
                    >
                      ×
                    </button>
                    <input
                      type="text"
                      class="tier-input"
                      [value]="tier"
                      (input)="handleTierInput($index, $event)"
                    />
                  </div>
                }
              </div>
            </div>

            <!-- Data Rows -->
            @for (row of section().rows(); track $index) {
              <app-pricing-row [row]="row" />
            }
          </div>

          <!-- Discount Field -->
          @if (section().discount) {
            <div class="discount-row">
              <label class="discount-label">
                Discount <span class="required-star">*</span>
              </label>
              <input
                type="text"
                class="discount-input"
                [value]="section().discount!()"
                (input)="handleDiscountInput($event)"
              />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .section-panel {
      margin-bottom: 16px;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      border: 1px solid #e9ecef;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: linear-gradient(135deg, #2c3e6b, #3b5998);
      color: #fff;
      cursor: pointer;
      user-select: none;
      transition: background 0.3s;
    }
    .section-header:hover {
      background: linear-gradient(135deg, #364878, #4468a8);
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      font-family: 'Inter', sans-serif;
    }

    .section-toggle {
      font-size: 22px;
      font-weight: 300;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      transition: background 0.2s;
    }
    .section-toggle:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .section-body {
      background: #fff;
      padding: 20px;
    }

    .animate-in {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .add-column-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 7px 16px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #2c8c6b, #2da87a);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
    }
    .add-column-btn:hover {
      background: linear-gradient(135deg, #238a60, #28a06f);
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(45, 168, 122, 0.3);
    }

    .table-scroll-container {
      overflow-x: auto;
      padding-bottom: 8px;
    }
    .table-scroll-container::-webkit-scrollbar {
      height: 6px;
    }
    .table-scroll-container::-webkit-scrollbar-track {
      background: #f1f3f5;
      border-radius: 3px;
    }
    .table-scroll-container::-webkit-scrollbar-thumb {
      background: #adb5bd;
      border-radius: 3px;
    }

    .tier-header-row {
      display: flex;
      align-items: flex-end;
      margin-bottom: 8px;
      gap: 0;
    }

    .row-label-spacer {
      min-width: 90px;
      padding-right: 12px;
      flex-shrink: 0;
    }

    .tier-headers {
      display: flex;
      gap: 8px;
    }

    .tier-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .remove-col-btn {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e9ecef;
      border: 1px solid #dee2e6;
      border-radius: 50%;
      font-size: 14px;
      font-weight: 700;
      color: #868e96;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
      line-height: 1;
    }
    .remove-col-btn:hover:not([disabled]) {
      background: #fa5252;
      border-color: #e03131;
      color: #fff;
    }
    .remove-col-btn[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .tier-input {
      width: 72px;
      padding: 8px 10px;
      border: 1px solid #adb5bd;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      text-align: center;
      background: #f8f9fa;
      font-weight: 600;
      color: #343a40;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .tier-input:focus {
      border-color: #3b5998;
      box-shadow: 0 0 0 3px rgba(59, 89, 152, 0.12);
      background: #fff;
    }

    .discount-row {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .discount-label {
      font-size: 13px;
      font-weight: 600;
      color: #495057;
      font-family: 'Inter', sans-serif;
    }
    .required-star {
      color: #e03131;
      font-weight: 700;
    }
    .discount-input {
      width: 100px;
      padding: 8px 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .discount-input:focus {
      border-color: #3b5998;
      box-shadow: 0 0 0 3px rgba(59, 89, 152, 0.12);
    }
  `],
})
export class PricingSectionComponent {
  section = input.required<PricingSection>();
  private stateService = inject(PricingStateService);

  toggleExpand(): void {
    this.section().isExpanded.update((v) => !v);
  }

  onAddColumn(): void {
    this.stateService.addColumn(this.section());
  }

  onRemoveColumn(index: number): void {
    this.stateService.removeColumn(this.section(), index);
  }

  handleTierInput(index: number, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const num = parseFloat(raw);
    this.section().tiers.update((t) => {
      const copy = [...t];
      copy[index] = isNaN(num) ? 0 : num;
      return copy;
    });
  }

  handleDiscountInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const num = parseFloat(raw);
    this.section().discount?.set(isNaN(num) ? 0 : num);
  }
}
