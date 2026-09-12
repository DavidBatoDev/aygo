# Aygo Operations Console — Demo MVP

A presentation-ready frontend prototype built with React 19, TypeScript, TanStack Router, and Tailwind CSS v4. The console runs entirely in the browser with a shared in-memory data store.

## Start

From the repository root, run `npm install` and `npm run dev:web`, then open http://localhost:3000. The API server is not required for the operations demo.

Changes survive navigation between screens. A page refresh or **Reset demo** restores the starting records. **Demo guide** in the sidebar opens a clickable presentation walkthrough. **Ctrl/Cmd + K** opens cross-record search.

## Screens

| Route | Features |
| --- | --- |
| `/` | Seven-day dispatch, derived operating figures, seven at-risk rows, upcoming jobs, order pipeline |
| `/catalogue` | Product cards and table view, search/category/supplier filters, product drawer, add colour, add product |
| `/inventory` | All stock rows sorted by free stock, health filters, signed adjustments with reasons, reorder policy, session adjustment history |
| `/orders` | Stage summaries and filtering, multi-line builder with snapshotted prices, MOQ and stock warnings, adjacent forward/back transitions |
| `/events` | Event creation, linked merch orders, equipment checklists with overlap warnings, crew assignment and stages |
| `/equipment` | Date-specific derived availability, maintenance overrides, job links and rates |
| `/suppliers` | Searchable directory, contacts, commercial terms and products needing restock |
| `/calendar` | Six-week month grid, multi-day events, deliveries, agenda creation, Done/Reopen |
| `/brand-kit` | Original brand reference |

## Five-minute presentation

1. **Overview:** introduce the week, stock holds, and live order pipeline. Every figure is calculated from the current demo state.
2. **Resolve a shortage:** open **AY-2607**, click its **Polo shirt / Navy / L — short 24** warning, receive **24** pieces, then reopen the order. The shortage clears and the existing hold stays intact.
3. **Create a promise:** create a multi-line order. Move through **Inquiry → Quoted → Approved** and show how approved pieces become held in Inventory. Continue to Delivered, then reverse to Ready to demonstrate stock reversal.
4. **Coordinate an event:** open **FSI executive summit**. Its LED wall overlaps **OutSystems**. Add a crew member or change gear and see availability update in Equipment.
5. **Close the loop:** add a calendar follow-up, mark it Done, and Reopen it. Reset the demo for the next audience.

## Seed data

- 33 products across seven categories and 163 colour/size stock rows.
- Six orders, five events, 13 equipment items, seven suppliers, and eight agenda entries.
- 1,820 held pieces, reconciled against Approved / In production / Ready orders.
- Dates are relative to the day the demo starts. Quantities use a deterministic hash.
- Three intentional shortage stories: navy/L polos (24 short in production), black caps (120 short when approved), and navy thermos tumblers (45 short while quoted).
- Stock and monetary totals are derived, rather than copied from the original prototype document. Prices, company contacts, booking dates, and stock counts are illustrative.

## Business rules

- Free stock is `qty - committed`; negative free stock is allowed and shown as out of stock.
- Quotes hold nothing. Approved, In production, and Ready hold the ordered quantities.
- Delivery releases the hold and deducts stock with a floor of zero. Actual delivery deductions are recorded on the order so reversing a clamped delivery restores exactly what was removed.
- Transitions are atomic in the shared store, adjacent-only, and idempotent for an already-applied target stage.
- Repeated variant lines are aggregated for holds and shortage detection.
- Manual adjustments require whole-number deltas and a reason, cannot make on-hand negative, and do not change held quantities. Their history is session-only.
- Maintenance overrides booking status. Date overlaps are inclusive. Overlaps warn while still allowing a deliberate assignment. Wrapped jobs stop reserving equipment.
- Gear totals are per day, as specified for the mock MVP.

## Code map

```text
src/features/ops/
  model.ts             Types, dates, stock/order helpers, transitions, availability
  seed.ts              Deterministic, linked demo records
  store.tsx            Session state, mutations, drawers, toasts, reset
  ui.tsx               Shared UI primitives and accessible native-dialog drawer
  console.tsx          Shell, navigation, global search, drawer dispatcher, guide
  overview.tsx         Dashboard and cross-links
  catalogue.tsx        Catalogue and inventory screens
  product-drawers.tsx  Product creation, variants, adjustments, reorder controls
  orders.tsx           Order screen, details and builder
  events.tsx           Event screen, details and creation
  resources.tsx        Equipment and suppliers
  calendar.tsx         Month grid and day drawer
  ops.css              Responsive application styling using brand tokens
```

## Assets

The three existing Aygo SVGs provide identity. Forty thumbnails under `public/products/` and `public/equipment/` are cropped from the supplied JJT catalogue PDF. Images are illustrative catalogue samples; swatches, not the pictured sample, specify an order's chosen colour. New products display an icon until a real asset is supplied.

Fonts are bundled locally through `@fontsource-variable/archivo` and `@fontsource-variable/bricolage-grotesque`. The console needs no external image or font service during a presentation.

To regenerate thumbnails, install PyMuPDF and Pillow in a Python environment, then run `python scripts/extract-catalogue.py` from the root with the original PDF in `.resources/`.

## Verification

```sh
npm run test:web
npm run build
```

Browser walkthroughs use Playwright:

```sh
npx playwright install chromium
npm run test:e2e
```

To use an installed Edge browser on Windows:

```powershell
$env:PLAYWRIGHT_CHANNEL='msedge'
npm run test:e2e
```

The browser tests start Vite automatically and cover all screens, mobile overflow, local image loading, shortages, order lifecycle, product/event creation, crew, calendar completion, demo reset, colour creation, stock policy, and equipment availability. Test artifacts are ignored by Git.

The demo uses session state rather than production authentication, persistence, supplier purchasing, invoices, or payments. The existing FastAPI scaffold remains available for the next implementation phase.
