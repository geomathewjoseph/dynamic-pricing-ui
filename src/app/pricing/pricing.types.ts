import { WritableSignal } from '@angular/core';

// ─── Cell Types ───────────────────────────────────────────────
export type CellValue = number | 'dropout' | 'n/a' | 'quote';

export interface Cell {
  value: WritableSignal<CellValue>;
  editable: boolean; // false for sentinel values
}

export interface Row {
  label: string;
  prices: Cell[];
}

// ─── Section Types ────────────────────────────────────────────
export type SectionType = 'flat' | 'size-matrix';

export interface PricingSection {
  key: string;
  name: string;
  type: SectionType;
  tiers: WritableSignal<number[]>;
  rows: WritableSignal<Row[]>;
  discount?: WritableSignal<number>;
  isExpanded: WritableSignal<boolean>;
}

// ─── Additional Charge Types ──────────────────────────────────
export type ChargeType =
  | 'fixed'
  | 'percentage'
  | 'size-tiered'
  | 'stitch-formula'
  | 'color-formula'
  | 'size-percentage-tiers';

export interface BaseCharge {
  key: string;
  name: string;
  type: ChargeType;
}

export interface FixedCharge extends BaseCharge {
  type: 'fixed';
  value: WritableSignal<number>;
}

export interface PercentageCharge extends BaseCharge {
  type: 'percentage';
  value: WritableSignal<number>;
}

export interface SizeTieredCharge extends BaseCharge {
  type: 'size-tiered';
  sizeTiers: number[];
  prices: WritableSignal<number>[];
}

export interface StitchFormulaCharge extends BaseCharge {
  type: 'stitch-formula';
  over: WritableSignal<number>;
  every: WritableSignal<number>;
  price: WritableSignal<number>;
}

export interface ColorFormulaCharge extends BaseCharge {
  type: 'color-formula';
  over: WritableSignal<number>;
  price: WritableSignal<number>;
}

export interface SizePercentageTiersCharge extends BaseCharge {
  type: 'size-percentage-tiers';
  sizeTiers: number[];
  percentages: WritableSignal<CellValue>[]; // can contain 'quote' sentinel
}

export type AdditionalCharge =
  | FixedCharge
  | PercentageCharge
  | SizeTieredCharge
  | StitchFormulaCharge
  | ColorFormulaCharge
  | SizePercentageTiersCharge;

// ─── Serialized Shapes (for localStorage) ────────────────────
export interface SerializedCell {
  value: CellValue;
}

export interface SerializedRow {
  label: string;
  prices: CellValue[];
}

export interface SerializedSection {
  key: string;
  tiers: number[];
  rows: SerializedRow[];
  discount?: number;
}

export interface SerializedCharge {
  key: string;
  type: ChargeType;
  [prop: string]: any;
}

export interface SerializedState {
  sections: SerializedSection[];
  ruiCharges: SerializedCharge[];
  frCharges: SerializedCharge[];
}
