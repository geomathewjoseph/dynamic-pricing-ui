# Dynamic Pricing Management UI

A production-quality **Angular 21** application for managing dynamic pricing configurations. Built with **signal-based state management**, per-cell reactivity, and a modular component architecture.

---

## 📸 Screenshots

### Overview
![Overview](screenshots/01-overview.png)

### FR Section — 2D Size Matrix
![FR Section](screenshots/02-fr-section.png)

### Fancy, Hi Vis & Default Sections
![Fancy Hi Vis Default](screenshots/03-fancy-hivis-default.png)

### Inserts, Reflective & Fancy Inserts
![Inserts Reflective](screenshots/04-inserts-reflective-fancy-inserts.png)

### RUI Additional Charges
![Additional Charges](screenshots/05-additional-charges.png)

### FR Additional Charges
![FR Charges](screenshots/06-fr-additional-charges.png)

---

## 🚀 Getting Started

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/`.

---

## 🏗️ Architecture

```
PricingContainerComponent (root)
├── PricingSectionComponent × N
│   ├── PricingRowComponent × M
│   │   └── PricingCellComponent × K
│   └── Discount field
├── AdditionalChargesComponent (RUI-level)
└── AdditionalChargesComponent (FR-level)
```

All components are **standalone**.

### Services

| Service | Responsibility |
|---------|---------------|
| `PricingNormalizerService` | Pure JSON → signal model transformation |
| `PricingStateService` | Signal state, serialization, column management, auto-persistence |

---

## 🎯 Key Features

- **Signal-Based Forms** — Every cell is a `WritableSignal<CellValue>`, no FormGroup/ngModel
- **Sentinel Values** — `dropout`, `n/a`, `quote` rendered as read-only badges
- **Dynamic Columns** — Add/remove with alignment invariant enforcement
- **Auto-Save** — Debounced (300ms) localStorage persistence via `effect()`
- **Immutable Updates** — All signal mutations use spread patterns
- **7 Pricing Sections** — FR (2D matrix), Default, Fancy, Hi Vis, Inserts, Reflective, Fancy Inserts
- **23 Additional Charges** — Fixed, percentage, size-tiered, stitch formula, color formula, size-percentage tiers

---

## 📁 File Structure

```
src/app/
├── app.ts
├── app.config.ts
└── pricing/
    ├── pricing.types.ts
    ├── pricing-normalizer.service.ts
    ├── pricing-state.service.ts
    ├── pricing-container/
    ├── pricing-section/
    ├── pricing-row/
    ├── pricing-cell/
    └── additional-charges/
```

---

## ⚠️ Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| Sentinel values (dropout, n/a, quote) | Read-only badges |
| Short price arrays | Padded to match tiers length |
| Remove last column | Blocked by guard |
| localStorage corruption | try/catch fallback to raw JSON |
| FR vs RUI charges | Separate signal arrays |

---

## 🛠️ Technologies

- **Angular 21** — standalone components, zoneless change detection
- **Signals API** — `signal`, `effect`, `WritableSignal`, `input()`
- **New control flow** — `@if`, `@for`, `@switch`
- **TypeScript** with strict typing
- **CSS** with gradients, transitions, shadows
- **Google Fonts** (Inter)
