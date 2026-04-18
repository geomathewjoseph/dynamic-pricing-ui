import { Injectable, signal } from '@angular/core';
import {
  CellValue,
  Cell,
  Row,
  PricingSection,
  AdditionalCharge,
  FixedCharge,
  PercentageCharge,
  SizeTieredCharge,
  StitchFormulaCharge,
  ColorFormulaCharge,
  SizePercentageTiersCharge,
} from './pricing.types';

@Injectable({ providedIn: 'root' })
export class PricingNormalizerService {

  // ─── Cell Helpers ─────────────────────────────────────────

  parseCell(raw: any): CellValue {
    if (typeof raw === 'number') return raw;
    if (raw === 'dropout' || raw === 'n/a' || raw === 'quote') return raw;
    return 0;
  }

  buildCell(raw: any): Cell {
    const val = this.parseCell(raw);
    return {
      value: signal(val),
      editable: typeof val === 'number',
    };
  }

  // ─── Padding Helper ───────────────────────────────────────

  padToLength(arr: any[], length: number): any[] {
    const copy = [...arr];
    while (copy.length < length) copy.push(0);
    return copy.slice(0, length);
  }

  // ─── Section Detection ────────────────────────────────────

  normalizeSection(key: string, value: any): PricingSection {
    if (
      value.size_tier &&
      Array.isArray(value.size_tier) &&
      typeof value.size_tier[0] === 'object'
    ) {
      return this.normalizeSizeMatrix(key, value);
    }
    return this.normalizeFlatSection(key, value);
  }

  // ─── Flat Section ─────────────────────────────────────────

  normalizeFlatSection(key: string, data: any): PricingSection {
    const tiers: number[] = data.item_tier ?? [];
    const rawPrices: any[] = data.price ?? [];
    const padded = this.padToLength(rawPrices, tiers.length);

    return {
      key,
      name: key.toUpperCase().replace(/_/g, ' '),
      type: 'flat',
      tiers: signal(tiers),
      rows: signal([
        { label: 'Price', prices: padded.map((p) => this.buildCell(p)) },
      ]),
      discount: signal(data.discount ?? 0),
      isExpanded: signal(false),
    };
  }

  // ─── Size Matrix Section (fr) ─────────────────────────────

  normalizeSizeMatrix(key: string, data: any): PricingSection {
    const tiers: number[] = data.item_tier ?? [];

    return {
      key,
      name: key.toUpperCase(),
      type: 'size-matrix',
      tiers: signal(tiers),
      rows: signal(
        data.size_tier.map((entry: any) => {
          const padded = this.padToLength(entry.price ?? [], tiers.length);
          return {
            label: `Size ${entry.size}`,
            prices: padded.map((p: any) => this.buildCell(p)),
          };
        })
      ),
      discount: signal(data.discount ?? 0),
      isExpanded: signal(false),
    };
  }

  // ─── Master Sections Normalizer ───────────────────────────

  normalizeSections(rui: any): PricingSection[] {
    const sections = Object.entries(rui)
      .filter(([key]) => key !== 'additional_charge')
      .map(([key, value]) => this.normalizeSection(key, value as any));

    // Expand the first section by default
    if (sections.length > 0) {
      sections[0].isExpanded.set(true);
    }

    return sections;
  }

  // ─── Additional Charges Normalizer ────────────────────────

  normalizeCharges(data: any): AdditionalCharge[] {
    if (!data) return [];

    return Object.entries(data).map(([key, value]: any) => {
      // Stitch formula: { over, every, price }
      if (value.over !== undefined && value.every !== undefined) {
        return {
          key,
          name: key,
          type: 'stitch-formula',
          over: signal(value.over),
          every: signal(value.every),
          price: signal(value.price),
        } as StitchFormulaCharge;
      }

      // Color formula: { over, price } (no every)
      if (value.over !== undefined && value.price !== undefined && !Array.isArray(value.price)) {
        return {
          key,
          name: key,
          type: 'color-formula',
          over: signal(value.over),
          price: signal(value.price),
        } as ColorFormulaCharge;
      }

      // Size-percentage tiers: { size_tier[], percentage[] }
      if (Array.isArray(value.percentage) && value.size_tier) {
        return {
          key,
          name: key,
          type: 'size-percentage-tiers',
          sizeTiers: value.size_tier,
          percentages: value.percentage.map((p: any) => {
            const parsed = this.parseCell(p);
            return signal(parsed);
          }),
        } as SizePercentageTiersCharge;
      }

      // Size-tiered price: { price[], size_tier[] }
      if (Array.isArray(value.price) && value.size_tier) {
        return {
          key,
          name: key,
          type: 'size-tiered',
          sizeTiers: value.size_tier,
          prices: value.price.map((p: number) => signal(p)),
        } as SizeTieredCharge;
      }

      // Percentage: { percentage: number }
      if (value.percentage !== undefined) {
        return {
          key,
          name: key,
          type: 'percentage',
          value: signal(value.percentage),
        } as PercentageCharge;
      }

      // Fixed price: { price: number }
      return {
        key,
        name: key,
        type: 'fixed',
        value: signal(value.price ?? 0),
      } as FixedCharge;
    });
  }

  // ─── Rebuild from serialized state ────────────────────────

  rebuildSections(serialized: any[]): PricingSection[] {
    return serialized.map((s, index) => ({
      key: s.key,
      name: s.key.toUpperCase().replace(/_/g, ' '),
      type: (s.rows.length > 1 ? 'size-matrix' : 'flat') as any,
      tiers: signal(s.tiers),
      rows: signal(
        s.rows.map((row: any) => ({
          label: row.label,
          prices: row.prices.map((p: any) => this.buildCell(p)),
        }))
      ),
      discount: signal(s.discount ?? 0),
      isExpanded: signal(index === 0),
    }));
  }

  rebuildCharges(serialized: any[]): AdditionalCharge[] {
    if (!serialized) return [];
    return serialized.map((c: any) => {
      switch (c.type) {
        case 'stitch-formula':
          return {
            key: c.key,
            name: c.key,
            type: 'stitch-formula',
            over: signal(c.over),
            every: signal(c.every),
            price: signal(c.price),
          } as StitchFormulaCharge;

        case 'color-formula':
          return {
            key: c.key,
            name: c.key,
            type: 'color-formula',
            over: signal(c.over),
            price: signal(c.price),
          } as ColorFormulaCharge;

        case 'size-percentage-tiers':
          return {
            key: c.key,
            name: c.key,
            type: 'size-percentage-tiers',
            sizeTiers: c.sizeTiers,
            percentages: c.percentages.map((p: any) => signal(this.parseCell(p))),
          } as SizePercentageTiersCharge;

        case 'size-tiered':
          return {
            key: c.key,
            name: c.key,
            type: 'size-tiered',
            sizeTiers: c.sizeTiers,
            prices: c.prices.map((p: number) => signal(p)),
          } as SizeTieredCharge;

        case 'percentage':
          return {
            key: c.key,
            name: c.key,
            type: 'percentage',
            value: signal(c.value),
          } as PercentageCharge;

        default:
          return {
            key: c.key,
            name: c.key,
            type: 'fixed',
            value: signal(c.value ?? 0),
          } as FixedCharge;
      }
    });
  }
}
