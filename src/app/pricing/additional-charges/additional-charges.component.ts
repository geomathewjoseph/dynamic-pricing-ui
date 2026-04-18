import { Component, input, WritableSignal } from '@angular/core';
import {
  AdditionalCharge,
  FixedCharge,
  PercentageCharge,
  SizeTieredCharge,
  StitchFormulaCharge,
  ColorFormulaCharge,
  SizePercentageTiersCharge,
  CellValue,
} from '../pricing.types';
import { signal } from '@angular/core';

@Component({
  selector: 'app-additional-charges',
  standalone: true,
  template: `
    <div class="charges-panel">
      <!-- Collapsible Header -->
      <div class="charges-header" (click)="toggleExpand()">
        <span class="charges-title">{{ title() }}</span>
        <span class="charges-toggle">
          {{ isExpanded() ? '−' : '+' }}
        </span>
      </div>

      @if (isExpanded()) {
        <div class="charges-body">
          @for (charge of charges(); track charge.key) {
            <div class="charge-card">
              <h4 class="charge-name">{{ formatName(charge.name) }}</h4>

              @switch (charge.type) {
                @case ('fixed') {
                  <div class="charge-field">
                    <label class="field-label">Price <span class="req">*</span></label>
                    <input
                      type="text"
                      class="field-input"
                      [value]="asFixed(charge).value()"
                      (input)="handleNumberInput(asFixed(charge).value, $event)"
                    />
                  </div>
                }

                @case ('percentage') {
                  <div class="charge-field">
                    <label class="field-label">Percentage <span class="req">*</span></label>
                    <input
                      type="text"
                      class="field-input"
                      [value]="asPercentage(charge).value()"
                      (input)="handleNumberInput(asPercentage(charge).value, $event)"
                    />
                  </div>
                }

                @case ('size-tiered') {
                  <div class="tiered-container">
                    <div class="tiered-row tiered-header-row">
                      <span class="tiered-label">Size Tier</span>
                      @for (tier of asSizeTiered(charge).sizeTiers; track $index) {
                        <span class="tiered-value tier-label">{{ tier }}</span>
                      }
                    </div>
                    <div class="tiered-row">
                      <span class="tiered-label">Price</span>
                      @for (price of asSizeTiered(charge).prices; track $index) {
                        <input
                          type="text"
                          class="field-input tiered-input"
                          [value]="price()"
                          (input)="handleNumberInput(price, $event)"
                        />
                      }
                    </div>
                  </div>
                }

                @case ('stitch-formula') {
                  <div class="formula-grid">
                    <div class="charge-field">
                      <label class="field-label">Over</label>
                      <input
                        type="text"
                        class="field-input"
                        [value]="asStitch(charge).over()"
                        (input)="handleNumberInput(asStitch(charge).over, $event)"
                      />
                    </div>
                    <div class="charge-field">
                      <label class="field-label">Every</label>
                      <input
                        type="text"
                        class="field-input"
                        [value]="asStitch(charge).every()"
                        (input)="handleNumberInput(asStitch(charge).every, $event)"
                      />
                    </div>
                    <div class="charge-field">
                      <label class="field-label">Price</label>
                      <input
                        type="text"
                        class="field-input"
                        [value]="asStitch(charge).price()"
                        (input)="handleNumberInput(asStitch(charge).price, $event)"
                      />
                    </div>
                  </div>
                  <p class="formula-desc">
                    Over {{ asStitch(charge).over() }} stitches, charge {{ '$' }}{{ asStitch(charge).price() }} per {{ asStitch(charge).every() }}
                  </p>
                }

                @case ('color-formula') {
                  <div class="formula-grid">
                    <div class="charge-field">
                      <label class="field-label">Over</label>
                      <input
                        type="text"
                        class="field-input"
                        [value]="asColor(charge).over()"
                        (input)="handleNumberInput(asColor(charge).over, $event)"
                      />
                    </div>
                    <div class="charge-field">
                      <label class="field-label">Price</label>
                      <input
                        type="text"
                        class="field-input"
                        [value]="asColor(charge).price()"
                        (input)="handleNumberInput(asColor(charge).price, $event)"
                      />
                    </div>
                  </div>
                  <p class="formula-desc">
                    Over {{ asColor(charge).over() }} colors, charge {{ '$' }}{{ asColor(charge).price() }} per extra
                  </p>
                }

                @case ('size-percentage-tiers') {
                  <div class="tiered-container">
                    <div class="tiered-row tiered-header-row">
                      <span class="tiered-label">Size Tier</span>
                      @for (tier of asSizePercentage(charge).sizeTiers; track $index) {
                        <span class="tiered-value tier-label">{{ tier }}</span>
                      }
                    </div>
                    <div class="tiered-row">
                      <span class="tiered-label">Percentage</span>
                      @for (pct of asSizePercentage(charge).percentages; track $index) {
                        @if (isSentinelValue(pct())) {
                          <span class="sentinel-badge">{{ pct() }}</span>
                        } @else {
                          <input
                            type="text"
                            class="field-input tiered-input"
                            [value]="pct()"
                            (input)="handleCellInput(pct, $event)"
                          />
                        }
                      }
                    </div>
                  </div>
                }

                @default {
                  <p class="unknown-type">Unknown charge type: {{ $any(charge).type }}</p>
                }
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .charges-panel {
      margin-bottom: 16px;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      border: 1px solid #e9ecef;
    }

    .charges-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: linear-gradient(135deg, #6b2c5e, #98593b);
      color: #fff;
      cursor: pointer;
      user-select: none;
      transition: background 0.3s;
    }
    .charges-header:hover {
      background: linear-gradient(135deg, #7b3c6e, #a8694b);
    }

    .charges-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      font-family: 'Inter', sans-serif;
    }

    .charges-toggle {
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
    .charges-toggle:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .charges-body {
      background: #fff;
      padding: 20px;
    }

    .charge-card {
      padding: 16px 0;
      border-bottom: 1px solid #f1f3f5;
    }
    .charge-card:last-child {
      border-bottom: none;
    }

    .charge-name {
      font-size: 14px;
      font-weight: 700;
      color: #343a40;
      font-family: 'Inter', sans-serif;
      margin: 0 0 10px 0;
      text-transform: capitalize;
    }

    .charge-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
    }

    .field-label {
      font-size: 12px;
      font-weight: 600;
      color: #6c757d;
      font-family: 'Inter', sans-serif;
    }
    .req {
      color: #e03131;
      font-weight: 700;
    }

    .field-input {
      width: 140px;
      padding: 8px 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .field-input:focus {
      border-color: #3b5998;
      box-shadow: 0 0 0 3px rgba(59, 89, 152, 0.12);
    }

    .formula-grid {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .formula-desc {
      margin: 8px 0 0;
      font-size: 12px;
      color: #868e96;
      font-style: italic;
      font-family: 'Inter', sans-serif;
    }

    .tiered-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tiered-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tiered-header-row {
      margin-bottom: 2px;
    }
    .tiered-label {
      min-width: 90px;
      font-size: 12px;
      font-weight: 600;
      color: #6c757d;
      font-family: 'Inter', sans-serif;
    }
    .tiered-value {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 72px;
    }
    .tier-label {
      font-size: 12px;
      font-weight: 700;
      color: #495057;
      background: #f8f9fa;
      padding: 6px 10px;
      border-radius: 4px;
      text-align: center;
    }
    .tiered-input {
      width: 72px;
      text-align: center;
    }

    .sentinel-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 72px;
      padding: 8px 10px;
      background: linear-gradient(135deg, #f1f3f5, #e9ecef);
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 12px;
      font-style: italic;
      font-weight: 500;
      color: #868e96;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: not-allowed;
    }

    .unknown-type {
      color: #e67700;
      font-size: 13px;
      font-style: italic;
    }
  `],
})
export class AdditionalChargesComponent {
  title = input<string>('ADDITIONAL CHARGE');
  charges = input.required<AdditionalCharge[]>();

  isExpanded = signal(false);

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
  }

  formatName(name: string): string {
    return name.replace(/_/g, ' ');
  }

  isSentinelValue(val: CellValue): boolean {
    return typeof val === 'string';
  }

  // Type narrowing helpers for template
  asFixed(c: AdditionalCharge): FixedCharge {
    return c as FixedCharge;
  }
  asPercentage(c: AdditionalCharge): PercentageCharge {
    return c as PercentageCharge;
  }
  asSizeTiered(c: AdditionalCharge): SizeTieredCharge {
    return c as SizeTieredCharge;
  }
  asStitch(c: AdditionalCharge): StitchFormulaCharge {
    return c as StitchFormulaCharge;
  }
  asColor(c: AdditionalCharge): ColorFormulaCharge {
    return c as ColorFormulaCharge;
  }
  asSizePercentage(c: AdditionalCharge): SizePercentageTiersCharge {
    return c as SizePercentageTiersCharge;
  }

  handleNumberInput(sig: WritableSignal<number>, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const num = parseFloat(raw);
    sig.set(isNaN(num) ? 0 : num);
  }

  handleCellInput(sig: WritableSignal<CellValue>, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const num = parseFloat(raw);
    sig.set(isNaN(num) ? 0 : num);
  }
}
