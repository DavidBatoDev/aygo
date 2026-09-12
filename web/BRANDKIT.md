# Aygo brand kit

The source of truth is `src/styles.css`, using Tailwind CSS v4's CSS-first `@theme`. The `/brand-kit` page is a live reference for the identity, palette, typography, and components. The operations console uses these brand colors with a denser application style in `src/features/ops/ops.css`, plus locally bundled Archivo and Bricolage Grotesque fonts.

## Identity

- Primary color: **Aygo blue `#003CF5`**, matched to the recreated SVGs.
- Personality: confident, friendly, optimistic. Use short, helpful copy.
- Assets: `/aygo-wordmark.svg`, `/aygo-stacked.svg`, `/aygo-icon.svg`.
- Use the horizontal wordmark by default, the stacked lockup where height allows, and the icon in compact spaces.
- Preserve proportions and at least one wordmark-dot-width of clear space. Keep the blue mark on white or a light neutral. Do not stretch, add shadows to, or recolor the mark. The SVGs are hand-recreated approximations of the reference image.

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `brand-600` | `#003CF5` | Logo, primary actions, focus outlines |
| `brand-700` / `brand-800` | `#0030C7` / `#062B9C` | Hover / pressed actions |
| `brand-50` / `brand-100` | `#EEF3FF` / `#DCE6FF` | Light branded surfaces |
| `ink-950` / `content` | `#0C1425` | Primary text, dark panels |
| `muted` | `#4D5970` | Secondary text |
| `canvas` | `#F7F8FA` | Page background |
| `surface` | `#FFFFFF` | Cards, controls |
| `border` | `#DCE0E8` | Decorative dividers and card edges |
| `lime-400` | `#C5F76B` | Sparse highlights; pair with `text-lime-950` |
| `success` / `success-soft` | `#166B46` / `#EAF7EF` | Positive feedback |
| `warning` / `warning-soft` | `#885409` / `#FFF5D6` | Attention needed |
| `danger` / `danger-soft` | `#B42338` / `#FFF0F2` | Errors and unavailable states |

Both `brand` and `ink` have full 50–950 scales. Tokens work across utilities: `bg-brand-600`, `text-brand-700`, `border-brand-200`, `ring-brand-600`, etc. Use white on primary blue; use dark text on lime. Reserve lighter blue tones for surfaces rather than body copy. Keep status meaning visible in text, not color alone.

## Typography

| Utilities | Purpose |
| --- | --- |
| `font-display text-display` | Responsive hero: 52–108px, tight tracking |
| `font-display text-heading` | Responsive section heading: 32–56px |
| `text-title` | Card heading: 24px |
| `text-base leading-relaxed` | Body: 16px |
| `text-sm` | Supporting copy and controls: 14px |
| `brand-eyebrow` | Uppercase section label: 11px |
| `font-mono text-xs` | Tokens and technical labels |

Fonts use local system fallbacks with no external requests. Inter is used when installed; otherwise Segoe UI / system sans is used. The display stack prefers Arial Rounded MT Bold when available. To make typography identical across platforms, add licensed self-hosted font files and `@font-face` declarations.

## Layout and shape

Use Tailwind's default 4px spacing scale: 8px for tight groups, 16–24px between elements, 32px card padding, and 80–96px between sections. `brand-container` gives a centered 1280px container with responsive gutters.

- `rounded-control`: 14px — buttons and fields.
- `rounded-card`: 24px — content cards.
- `rounded-panel`: 32px — large hero panels.
- `rounded-full`: badges and decorative circles.
- `shadow-card`: subtle neutral elevation.
- `shadow-brand`: blue-tinted emphasis; use sparingly.
- `duration-200 ease-brand`: standard interaction timing. Reduced-motion preferences are respected globally.

## Reusable styles

```tsx
<section className="brand-card">
  <p className="brand-eyebrow">Picked for you</p>
  <h2 className="mt-3 text-title">Your next favorite.</h2>
  <p className="mt-2 text-muted">Something good is just around the corner.</p>
  <button className="brand-button brand-button-primary mt-6">Explore</button>
</section>

<button className="brand-button brand-button-secondary">View details</button>
<button className="brand-button brand-button-accent">Discover more</button>
<button className="brand-button brand-button-primary" disabled>Unavailable</button>

<label htmlFor="email" className="mb-2 block text-sm font-semibold">Email</label>
<input id="email" type="email" className="brand-input" />

<span className="brand-badge brand-badge-success">In stock</span>
```

Button and badge modifiers are combined with their base classes. Badge variants: `neutral`, `success`, `warning`, `danger`. Inputs support `disabled` and `aria-invalid="true"`; associate error copy with `aria-describedby`. Controls have 48px minimum height, visible keyboard focus, and disabled styling. Use actual buttons for actions and anchors for navigation.
