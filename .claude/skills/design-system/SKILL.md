---
name: design-system
description: Retro-futuristic instrument UI design system with warm industrial minimalism, IBM Plex Mono typography, and tactile controls
---

# Design System

## Core Brief

Retro-futuristic instrument UI: warm industrial minimalism — IBM Plex Mono all-caps typography, muted warm greys, tactile controls with subtle gradients and warm shadows, dense technical sidebars, airy poster-like canvas.

## Typography Rules

### Font Stack
- **Primary**: IBM Plex Mono (weights 200–400, prefer 300)
- **Fallback**: ui-monospace, SFMono-Regular, Menlo, monospace
- **All UI labels**: ALL CAPS

### Typography Usage

**UI labels / controls (small)**
- `font-family: IBM Plex Mono`
- `letter-spacing: 0.08em` (tracking-wider)
- `text-transform: uppercase`
- `font-weight: 300`

**Body/control text (readouts, numeric values)**
- `font-family: IBM Plex Mono`
- `text-transform: none`
- `font-weight: 300–400`

**Subtle emphasis (active labels, selected values)**
- `font-weight: 500`

### Sizing Scale

| Use Case | Size | Tailwind Class |
|----------|------|----------------|
| XS label (tiny buttons, section labels) | 10px | `text-xs` |
| SM label (most control labels) | 12px | `text-sm` |
| Base/readout (numeric, descriptions) | 14px | `text-base` |
| Headline/canvas title | 16–18px | `text-lg` / `text-xl` |

**Casing rule**: Labels ALL CAPS; content text and numeric readouts sentence case.

**Tracking**: UI labels use `letter-spacing: 0.06em–0.12em` (tighter for larger sizes).

## Color System

### Base Palette (Warm Greys)

**Light Mode**
- `base-50`: #faf7f3 (page background)
- `base-100`: #f3efe9 (surface/panels)
- `base-200`: #e7dfd5 (disabled states)
- `base-400`: #b8a691 (muted text accessible)
- `base-500`: #8d7a65 (muted text)
- `base-800`: #453627 (primary text)
- `base-900`: #2b2014 (darkest)

**Dark Mode**
- `base-900`: #2b2014 (page background)
- `base-800`: #453627 (surface/panels)
- `base-700`: #5a4835 (elevated surfaces)
- `base-500`: #8d7a65 (muted text dark)
- `base-400`: #b8a691 (muted text dark accessible)
- `base-100`: #f3efe9 (primary text dark)
- `base-50`: #faf7f3 (lightest)

### Accent Colors

**Primary (Action/Interactive)**
- `accent-primary-300`: #ffb85c (lighter tint for dark mode text)
- `accent-primary-500`: #ff9b20 (main action color)
- `accent-primary-700`: #d67d14 (darker gradient end)

**Secondary (Info/Diagnostics)**
- `accent-secondary-300`: #cda78c (lightened for dark mode)
- `accent-secondary-500`: #a8765e (info/metadata)
- `accent-secondary-700`: #8a5d47 (warnings)

### UI Tokens

**Divider**
- Light: `#d7cbbf` (solid warm line)
- Dark: `rgba(255, 210, 160, 0.06)` (thin warm translucent)

**Focus Ring**
- `rgba(255, 209, 149, 0.08)` (subtle warm halo)

### Semantic Token Usage

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `bg-page` | base-50 | base-900 |
| `bg-surface` | base-100 | base-800 |
| `bg-elevated` | base-100 | base-700 |
| `text-primary` | base-800 | base-100 |
| `text-muted` | base-500 | base-400 |
| `divider` | #d7cbbf | rgba(255,210,160,0.06) |
| `accent-action` | accent-primary-500 | accent-primary-500 |
| `accent-info` | accent-secondary-500 | accent-secondary-300 |
| `focus-ring` | rgba(255,209,149,0.08) | rgba(255,209,149,0.12) |

### Contrast Guidance

- Text on backgrounds: 4.5:1 minimum for body text
- UI labels on small elements: 3:1 minimum
- Use `accent-primary-300` for text in dark mode if `accent-primary-500` fails contrast
- Reserve `accent-primary-500` for icons/indicators in dark mode

## Gradients & Tactile Depth

Use soft axial gradients for tactile surfaces only (buttons, slider handles, active bars). Keep canvas and layout flat.

### Examples

**Button (subtle depth)**
```css
background: linear-gradient(180deg, #ff9b20 0%, #d67d14 100%);
```
Tailwind: `bg-gradient-to-b from-accent-primary-500 to-accent-primary-700`

**Slider handle highlight**
```css
background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02));
```

**Surface rim/inset**
```css
box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 6px 18px rgba(69,40,20,0.12);
```

**Light/dark variants**
- Light: stronger rim highlight (white translucent)
- Dark: weaker rim + slightly brighter inner glow near top edge

## Spacing, Density, Layout

### Global Rhythm
- Base unit: 4px
- Small: 8px (`space-2`)
- Control spacing (sidebar compact): 8–12px (`space-2` / `space-3`)
- Canvas margin / gallery spacing: 24–48px (`space-6` / `space-12`)

### Sidebar
- Width options:
  - Narrow: 320px (compact)
  - Wider diagnostic: 420px
- Section spacing: 8px vertical stack + 12–16px between groups
- Divider: 1px warm line with 8px vertical padding

### Canvas
- Margin around A4 view: 24px minimum
- Center with poster breathing room
- Background: flat, optional subtle paper texture via base-50/base-900 noise overlay

## Elevation & Borders

### Elevation Levels

| Level | Shadow |
|-------|--------|
| `flat` | none (canvas, page) |
| `surface` | none or `control-sm` on light |
| `control` | `control-sm` for small interactive UI |
| `control-active` | `control-md` |
| `prominent` | `control-lg` for modals/dialogs |

**Shadow Tokens**
- `control-sm`: `0 1px 3px rgba(69,40,20,0.08), 0 1px 2px rgba(69,40,20,0.06)`
- `control-md`: `0 4px 8px rgba(69,40,20,0.1), 0 2px 4px rgba(69,40,20,0.06)`
- `control-lg`: `0 10px 24px rgba(69,40,20,0.12), 0 4px 8px rgba(69,40,20,0.08)`

### Borders
- Thin single-pixel (1px) warm divider lines
- Controls: 1px inner ridge + subtle outer shadow

### Corners
- Controls: `rounded-md` (6px) or `rounded-lg` (8px)
- Handles: `rounded-md` (6px) for chamfered mechanical feel
- Diagnostic cards: `rounded-lg` (12px)

## Controls Styling

### Text Inputs (read/write)

**Structure**
- Height: 36px (compact) / 44px (comfortable)
- Padding: 8px left + right (`px-2`)
- Border: 1px solid divider
- Background: bg-surface
- Font: IBM Plex Mono, text-sm, font-weight: 300

**Focus**
- `outline: none`
- `box-shadow: 0 0 0 4px focus-ring`
- Border color: accent-primary-500 (0.9 opacity)

**Disabled**
- Background: base-200
- Text: muted
- Cursor: not-allowed

**Error**
- Small underline in accent-secondary-700 for warnings

### Sliders (terminal pseudo-industrial)

**Track**
- Height: 6px (thin)
- Rounded ends: `rounded-full`
- Background (inactive): rgba(69,40,20,0.06) or base-200
- Active portion: gradient based on accent-primary with subtle inner glow
- Ticks: 1px marks every N%

**Handle**
- Size: 16–20px square or slightly rounded (chamfer/bevel)
- Visual: gradient top highlight + warm shadow (control-sm)
- Border: thin rim (1px slightly lighter)
- Focus: halo `box-shadow: 0 0 0 6px rgba(255,209,149,0.06)`

**Value readout**
- Numeric label to right with text-sm, font-weight: 400
- Unit in muted tone

### Sidebar Section Frames

**Container**
- No heavy cards — continuous surface with thin dividers
- Section header: small ALL-CAPS label (text-xs, tracking-wider, text-muted)
- Grouping: compact control groups, inner padding 8px

**Diagnostics**
- Small framed blocks with bg-surface, rounded-lg, shadow control-sm for visual separation
- Visually dense but compact

## Interaction & Motion

### Durations
- Micro (hover/quick): 80ms
- Regular (state changes): 120–180ms
- Larger (panel open): 220–260ms

### Easing
- `cubic-bezier(.2, .07, .1, 1)` (pendulum)

### Motion Rules
- Prefer opacity + translateY for entrance
- Avoid elastic or bouncy easings
- Use subtle continuous progress cues (thin progress fills on instant simulations)
- Maintain 60fps target for real-time simulation UI

## Accessibility & UX

### Contrast
- Text on backgrounds: 4.5:1 minimum for body text
- UI labels on small elements: 3:1 minimum where necessary
- Ensure accent-primary on base-800 meets accessible contrast
- If not, use lighter tint for text on accent

### Focus
- Keyboard focus must be visible: 2px border + focus-ring halo

### Touch
- Targets: min 44×44px for interactive buttons on touch

### Reduced Motion
- Respect `prefers-reduced-motion` — reduce or eliminate non-essential movement

## Copy & Label Guidelines

### Tone
Academic, precise, slightly elevated; not comedic. Use single-line labels where possible. Prefer noun phrases.

### Examples

| Original | Design System Label |
|----------|---------------------|
| "Statistics" | SPATIO-TEMPORAL ANALYSIS |
| "Simulation Parameters" | REALITY CONFIGURATION |
| "Reset" | STATE REINITIALIZATION |
| "Run (instant)" | EXECUTE: INSTANT MODE |
| "Run (realtime)" | EXECUTE: REAL-TIME MODE |
| "Gravity" | GRAVITATIONAL COEFFICIENT |
| "Damping" | DISSIPATIVE FRICTION FACTOR |
| "Pendulum length" | SUSPENSION RADIUS |

### Label Syntax

- **Section headers**: ALL CAPS (IBM Plex Mono) `SPATIO-TEMPORAL ANALYSIS`
- **Field labels**: Small ALL CAPS, muted `INITIAL ANGLE`
- **Field values**: Sentence case or numeric with units `2.4 m`
- **Tooltips/helper text**: Short sentence case descriptive lines (14px)

Cheesy technical flourishes allowed sparingly in explanatory copy (e.g., "data courtesy of quasi-linear integrator").

## Implementation Notes

### Tailwind v4 Custom Color Configuration

Define custom colors in CSS using `@theme` directive:

```css
@theme {
  --color-base-50: #faf7f3;
  --color-base-100: #f3efe9;
  --color-base-200: #e7dfd5;
  --color-base-400: #b8a691;
  --color-base-500: #8d7a65;
  --color-base-800: #453627;
  --color-base-900: #2b2014;

  --color-accent-primary-300: #ffb85c;
  --color-accent-primary-500: #ff9b20;
  --color-accent-primary-700: #d67d14;

  --color-accent-secondary-300: #cda78c;
  --color-accent-secondary-500: #a8765e;
  --color-accent-secondary-700: #8a5d47;
}
```

### Font Configuration

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@200;300;400;500&display=swap');

@theme {
  --font-family-display: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
  --font-family-mono: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
}
```

### Dark Mode Implementation

Use `class` strategy with `dark:` prefix:

```html
<html class="dark">
  <!-- dark mode active -->
</html>
```

```css
<div class="bg-base-100 dark:bg-base-800 text-base-800 dark:text-base-100">
  <!-- responsive to dark mode -->
</div>
```
