import { Injectable, signal, effect, WritableSignal, inject } from '@angular/core';
import {
  CellValue,
  PricingSection,
  AdditionalCharge,
  SerializedState,
  FixedCharge,
  PercentageCharge,
  SizeTieredCharge,
  StitchFormulaCharge,
  ColorFormulaCharge,
  SizePercentageTiersCharge,
} from './pricing.types';
import { PricingNormalizerService } from './pricing-normalizer.service';

const STORAGE_KEY = 'pricing';

@Injectable({ providedIn: 'root' })
export class PricingStateService {
  private normalizer = inject(PricingNormalizerService);

  // ─── Top-level State Signals ──────────────────────────────
  sections = signal<PricingSection[]>([]);
  ruiCharges = signal<AdditionalCharge[]>([]);
  frCharges = signal<AdditionalCharge[]>([]);

  private initialized = false;

  constructor() {
    // Auto-save with debounce and cleanup
    effect((onCleanup) => {
      const data = this.serialize();
      if (!this.initialized) return;
      const t = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }, 300);
      onCleanup(() => clearTimeout(t));
    });
  }

  // ─── Initialize ───────────────────────────────────────────

  initialize(rawJson: any): void {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed: SerializedState = JSON.parse(saved);
        this.sections.set(this.normalizer.rebuildSections(parsed.sections));
        this.ruiCharges.set(this.normalizer.rebuildCharges(parsed.ruiCharges));
        this.frCharges.set(this.normalizer.rebuildCharges(parsed.frCharges));
        this.initialized = true;
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Normalize from raw JSON
    const rui = rawJson.data.embroidered_specials.rui;
    this.sections.set(this.normalizer.normalizeSections(rui));
    this.ruiCharges.set(this.normalizer.normalizeCharges(rui.additional_charge));

    // FR-level additional charges
    const frSection = rui.fr;
    if (frSection?.additional_charge) {
      this.frCharges.set(this.normalizer.normalizeCharges(frSection.additional_charge));
    }

    this.initialized = true;
  }

  // ─── Column Management ────────────────────────────────────

  addColumn(section: PricingSection): void {
    section.tiers.update((t) => [...t, 0]);
    section.rows.update((rs) =>
      rs.map((row) => ({
        ...row,
        prices: [
          ...row.prices,
          { value: signal(0 as CellValue), editable: true },
        ],
      }))
    );
  }

  removeColumn(section: PricingSection, index: number): void {
    if (section.tiers().length <= 1) return;
    section.tiers.update((t) => t.filter((_, idx) => idx !== index));
    section.rows.update((rs) =>
      rs.map((row) => ({
        ...row,
        prices: row.prices.filter((_, idx) => idx !== index),
      }))
    );
  }

  // ─── Serialization ───────────────────────────────────────

  serialize(): SerializedState {
    return {
      sections: this.sections().map((s) => ({
        key: s.key,
        tiers: s.tiers(),
        rows: s.rows().map((row) => ({
          label: row.label,
          prices: row.prices.map((c) => c.value()),
        })),
        discount: s.discount?.(),
      })),
      ruiCharges: this.ruiCharges().map((c) => this.serializeCharge(c)),
      frCharges: this.frCharges().map((c) => this.serializeCharge(c)),
    };
  }

  private serializeCharge(charge: AdditionalCharge): any {
    switch (charge.type) {
      case 'fixed':
        return { key: charge.key, type: charge.type, value: (charge as FixedCharge).value() };
      case 'percentage':
        return { key: charge.key, type: charge.type, value: (charge as PercentageCharge).value() };
      case 'size-tiered': {
        const st = charge as SizeTieredCharge;
        return {
          key: charge.key,
          type: charge.type,
          sizeTiers: st.sizeTiers,
          prices: st.prices.map((p) => p()),
        };
      }
      case 'stitch-formula': {
        const sf = charge as StitchFormulaCharge;
        return {
          key: charge.key,
          type: charge.type,
          over: sf.over(),
          every: sf.every(),
          price: sf.price(),
        };
      }
      case 'color-formula': {
        const cf = charge as ColorFormulaCharge;
        return {
          key: charge.key,
          type: charge.type,
          over: cf.over(),
          price: cf.price(),
        };
      }
      case 'size-percentage-tiers': {
        const sp = charge as SizePercentageTiersCharge;
        return {
          key: charge.key,
          type: charge.type,
          sizeTiers: sp.sizeTiers,
          percentages: sp.percentages.map((p) => p()),
        };
      }
      default: {
        const fallback = charge as any;
        return { key: fallback.key, type: fallback.type };
      }
    }
  }

  // ─── Clear saved state ────────────────────────────────────

  clearSavedState(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
