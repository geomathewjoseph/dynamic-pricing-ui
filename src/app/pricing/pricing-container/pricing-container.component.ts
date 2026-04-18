import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PricingStateService } from '../pricing-state.service';
import { PricingSectionComponent } from '../pricing-section/pricing-section.component';
import { AdditionalChargesComponent } from '../additional-charges/additional-charges.component';

@Component({
  selector: 'app-pricing-container',
  standalone: true,
  imports: [PricingSectionComponent, AdditionalChargesComponent],
  template: `
    <div class="pricing-container">
      <!-- Header -->
      <div class="pricing-header">
        <div class="header-content">
          <h1 class="header-title">Dynamic Pricing Management</h1>
          <p class="header-subtitle">Embroidered Specials — RUI Configuration</p>
        </div>
        <div class="header-actions">
          <button class="reset-btn" (click)="onReset()">
            <span class="reset-icon">↻</span> Reset to Default
          </button>
        </div>
      </div>

      @if (isLoading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading pricing data...</p>
        </div>
      } @else {
        <!-- Pricing Sections -->
        <div class="sections-container">
          @for (section of stateService.sections(); track section.key) {
            <app-pricing-section [section]="section" />
          }
        </div>

        <!-- RUI-level Additional Charges -->
        @if (stateService.ruiCharges().length > 0) {
          <app-additional-charges
            [title]="'ADDITIONAL CHARGE'"
            [charges]="stateService.ruiCharges()"
          />
        }

        <!-- FR-level Additional Charges -->
        @if (stateService.frCharges().length > 0) {
          <app-additional-charges
            [title]="'FR ADDITIONAL CHARGE'"
            [charges]="stateService.frCharges()"
          />
        }
      }

      <!-- Footer -->
      <div class="pricing-footer">
        <p>Auto-saved to local storage • {{ sectionCount }} sections • {{ totalCharges }} additional charges</p>
      </div>
    </div>
  `,
  styles: [`
    .pricing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .pricing-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      padding: 24px 28px;
      background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
      border-radius: 14px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .header-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .header-title {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      margin: 0;
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.3px;
    }

    .header-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
      font-family: 'Inter', sans-serif;
      font-weight: 400;
    }

    .header-actions {
      flex-shrink: 0;
    }

    .reset-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.2s;
    }
    .reset-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-1px);
    }
    .reset-icon {
      font-size: 16px;
    }

    .sections-container {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e9ecef;
      border-top-color: #3b5998;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      margin-top: 16px;
      font-size: 14px;
      color: #868e96;
      font-family: 'Inter', sans-serif;
    }

    .pricing-footer {
      margin-top: 24px;
      padding: 16px 20px;
      text-align: center;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e9ecef;
    }
    .pricing-footer p {
      margin: 0;
      font-size: 12px;
      color: #868e96;
      font-family: 'Inter', sans-serif;
    }
  `],
})
export class PricingContainerComponent implements OnInit {
  private http = inject(HttpClient);
  stateService = inject(PricingStateService);

  isLoading = true;

  get sectionCount(): number {
    return this.stateService.sections().length;
  }

  get totalCharges(): number {
    return this.stateService.ruiCharges().length + this.stateService.frCharges().length;
  }

  ngOnInit(): void {
    this.http.get<any>('assets/pricing.json').subscribe({
      next: (json) => {
        this.stateService.initialize(json);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load pricing data:', err);
        this.isLoading = false;
      },
    });
  }

  onReset(): void {
    this.stateService.clearSavedState();
    this.isLoading = true;
    this.http.get<any>('assets/pricing.json').subscribe({
      next: (json) => {
        this.stateService.initialize(json);
        this.isLoading = false;
      },
    });
  }
}
