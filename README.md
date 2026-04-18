# Dynamic Pricing Management UI

A production-quality **Angular 17+** application for managing dynamic pricing configurations for embroidered specials. Built with **signal-based state management**, per-cell reactivity, and a modular component architecture.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build
```

Navigate to `http://localhost:4200/` once the dev server is running.

---

## 📊 JSON Structure Analysis

### Source Path
```
data.embroidered_specials.rui
```

### Pricing Sections (7 total)

| Section | Type | Rows | Tiers | Sentinel Values |
|---------|------|------|-------|-----------------|
| `default` | flat | 1 (price) | 31 | `dropout` |
| `inserts` | flat | 1 (price) | 31 | `dropout` |
| `fancy` | flat | 1 (price) | 31 | `dropout` |
| `hi_vis` | flat | 1 (price) | 31 | `dropout` |
| `reflective` | flat | 1 (price) | 28 | `n/a`, `dropout` |
| `fancy_inserts` | flat | 1 (price) | 30 | `dropout` |
| `fr` | size-matrix | 9 (per size) | 10 | none |

### Additional Charge Groups

**RUI-level** (13 charges): size, blunt_corners, square_corners, irregular_shape, metallic_merrow, metallic_thread, velcro_one_side, velcro_two_side, stitch_overcharge, pressure_sensitive, sharp_round_corners, metallic_merrow_thread, no_of_color_overcharge

**FR-level** (10 charges): size, blunt_corners, square_corners, irregular_shape, velcro_one_side, velcro_two_side, stitch_overcharge, pressure_sensitive, sharp_round_corners, no_of_color_overcharge

### Additional Charge Sub-Types

| Sub-type | JSON Pattern | UI Rendering |
|----------|-------------|--------------|
| Fixed price | `{ price: number }` | Single input field |
| Percentage | `{ percentage: number }` | Single input field |
| Size-tiered price | `{ price: [], size_tier: [] }` | Tier labels + price inputs |
| Stitch formula | `{ over, every, price }` | Three input fields + formula description |
| Color formula | `{ over, price }` | Two input fields + formula description |
| Size-percentage tiers | `{ size_tier: [], percentage: [] }` | Tier labels + percentage inputs (with `"quote"` sentinel) |

---

## 🏗️ Architecture

### Component Architecture

```
PricingContainerComponent (root)
├── PricingSectionComponent × N (one per pricing section)
│   ├── PricingRowComponent × M (one per row in section)
│   │   └── PricingCellComponent × K (one per tier column)
│   └── Discount field
├── AdditionalChargesComponent (RUI-level charges)
└── AdditionalChargesComponent (FR-level charges)
```

All components are **standalone** (Angular 17+ pattern).

### Services

| Service | Responsibility |
|---------|---------------|
| `PricingNormalizerService` | Pure JSON → signal model transformation. No side effects. |
| `PricingStateService` | Owns all signals, handles serialization/hydration, column management, auto-persistence |

### Types File

`pricing.types.ts` contains all interfaces:
- `CellValue`, `Cell`, `Row` — cell-level types
- `PricingSection` — section model with `WritableSignal` fields
- `AdditionalCharge` — discriminated union of 6 charge sub-types
- `Serialized*` — shapes for localStorage persistence

---

## 🎯 Key Design Decisions

### 1. Signal-Based State (No Forms API)

Every editable value is a `WritableSignal<CellValue>`. This gives:
- **Per-cell reactivity** — changing one cell doesn't re-render the entire table
- **Fine-grained updates** — only the affected DOM node updates
- **No FormGroup/FormControl/ngModel** — as required by constraints

### 2. Sentinel Value Handling

Sentinel values (`"dropout"`, `"n/a"`, `"quote"`) are:
- Preserved exactly as strings — never converted to 0 or empty
- Rendered as **read-only styled badges** (grey background, italic, uppercase)
- Determined at `buildCell()` time: `editable = typeof val === 'number'`
- Protected from user modification via conditional rendering (`@if (cell.editable)`)

### 3. Per-Section Isolated State

Each `PricingSection` maintains its own:
- `tiers: WritableSignal<number[]>` — column definitions
- `rows: WritableSignal<Row[]>` — row data
- `discount: WritableSignal<number>` — discount value
- `isExpanded: WritableSignal<boolean>` — collapse state

No shared global signal across sections.

### 4. Immutable Updates

All signal updates use immutable patterns:
```typescript
// Adding a column
section.tiers.update(t => [...t, 0]);
section.rows.update(rs => rs.map(row => ({
  ...row,
  prices: [...row.prices, { value: signal(0), editable: true }]
})));
```

### 5. Dynamic Column Management

- **Add column**: Appends to `tiers` array and adds a new `Cell` to every row
- **Remove column**: Filters out the column at index `i` from both `tiers` and all row prices
- **Invariant**: `row.prices.length === tiers().length` is always maintained
- **Guard**: Cannot remove the last column

### 6. Persistence Strategy

- **Auto-save**: `effect()` with `onCleanup` implements debounced (300ms) localStorage persistence
- **Hydration**: On init, checks localStorage first; falls back to raw JSON normalization
- **Serialization**: Recursively unwraps all signals to plain values
- **Reset**: Clears localStorage and re-normalizes from pristine JSON

### 7. Padding Alignment

`padToLength()` ensures `price[].length === item_tier[].length`:
```typescript
function padToLength(arr: any[], length: number): any[] {
  const copy = [...arr];
  while (copy.length < length) copy.push(0);
  return copy.slice(0, length);
}
```

---

## 📁 File Structure

```
src/app/
├── app.ts                          # Root component
├── app.config.ts                   # App configuration (HttpClient)
└── pricing/
    ├── pricing.types.ts            # All type definitions
    ├── pricing-normalizer.service.ts  # JSON normalization
    ├── pricing-state.service.ts    # Signal state management
    ├── pricing-container/
    │   └── pricing-container.component.ts
    ├── pricing-section/
    │   └── pricing-section.component.ts
    ├── pricing-row/
    │   └── pricing-row.component.ts
    ├── pricing-cell/
    │   └── pricing-cell.component.ts
    └── additional-charges/
        └── additional-charges.component.ts
```

---

## ⚠️ Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| Sentinel values (dropout, n/a) | Preserved as strings, rendered as read-only badges |
| Short price arrays | Padded with 0 to match tiers length |
| Remove last column | Blocked by guard (`tiers.length <= 1`) |
| Unknown charge type | Logged warning, rendered as read-only display |
| FR additional_charge vs RUI | Normalized independently into separate signal arrays |
| `"quote"` in percentages | Treated as sentinel in size-percentage-tiers |
| localStorage corruption | Caught by try/catch, falls back to raw JSON |

---

## 🛠️ Technologies

- **Angular 17+** with standalone components
- **Signals API** for fine-grained reactivity
- **TypeScript** with strict type checking
- **CSS** with modern design (gradients, transitions, shadows)
- **Google Fonts** (Inter) for premium typography
