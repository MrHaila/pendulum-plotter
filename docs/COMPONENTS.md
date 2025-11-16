# Component Structure

## Layout Overview

```
App.vue
├── Sidebar (left column)
│   ├── ControlPanel
│   │   ├── ParameterControls
│   │   └── SimulationControls
│   └── DiagnosticsPanel
│       ├── TopDownView
│       ├── SideView
│       └── StateDisplay
└── MainArea (right column)
    ├── PaintCanvas (A4 output)
    └── DebugCanvas (overflow visualization)
```

## Component Specifications

### `App.vue`

**Root component.**

- Creates simulation via `useSimulation()` composable
- Provides state to child components
- Manages layout (two-column grid)
- Handles real-time animation loop

```vue
<script setup lang="ts">
import { useSimulation } from '@/composables/useSimulation'

const { state, paintPoints, step, runInstant, reset } = useSimulation(config)
</script>
```

### `Sidebar.vue`

**Left column container.**

- Flexbox layout for cards
- Scrollable if content overflows
- Styled with borders/shadows for visual separation

### `ControlPanel.vue`

**User inputs and actions.**

**Sections:**
1. **Parameter controls**: Sliders/inputs for pendulum properties
2. **Simulation controls**: Start/Stop/Reset buttons, mode toggle

**Props:**
- `config: SimulationConfig` (v-model)

**Emits:**
- `start-instant`: Trigger instant generation
- `start-realtime`: Begin animation
- `stop`: Pause animation
- `reset`: Clear and reinitialize

**Features:**
- Labeled range sliders with live value display
- Preset buttons (e.g., "Circular", "Figure-8", "Chaotic")
- Export SVG button

### `ParameterControls.vue`

**Individual parameter inputs.**

Each parameter as labeled slider:
- Rope length: 50-500 units
- Gravity: 0-20 m/s²
- Damping: 0-1
- Initial theta: 0-2π
- Initial phi: 0-π
- Initial velocities: -5 to 5 rad/s

Display current numeric value next to slider.

### `SimulationControls.vue`

**Action buttons.**

- Mode toggle: Instant / Real-time
- Instant mode: "Generate" button, steps input
- Real-time mode: "Start" / "Stop" / "Pause" buttons
- "Reset" button (always visible)
- "Export SVG" button

### `DiagnosticsPanel.vue`

**Visual debugging information.**

Contains multiple card-style views, each independently scrollable/collapsible.

### `TopDownView.vue`

**Bird's eye view (XZ plane).**

**Props:**
- `pendulumPosition: Vec3`
- `paintPoints: Point2D[]`
- `ropeLength: number`

**Rendering:**
- Canvas element
- Draw XZ projection of pendulum (circle showing swing boundary)
- Dot for current bucket position
- Faint trail of recent positions
- Grid or crosshairs for reference

### `SideView.vue`

**Orthogonal side projection (XY or YZ).**

**Props:**
- `pendulumPosition: Vec3`
- `axis: 'x' | 'z'` (which side to show)
- `ropeLength: number`

**Rendering:**
- Canvas element
- Vertical line from origin to bucket (rope)
- Bucket position as circle
- Ground line at Y = ropeLength
- Shows height and lateral displacement

### `StateDisplay.vue`

**Text readout of current state.**

Display:
- Current theta, phi (in degrees and radians)
- Angular velocities
- Cartesian position (x, y, z)
- Time elapsed
- Number of paint points

Formatted as key-value table or labeled text.

### `PaintCanvas.vue`

**Main output: A4 paint trail.**

**Props:**
- `paintPoints: Point2D[]`
- `width: number` (canvas pixel width)
- `height: number` (canvas pixel height)

**Rendering:**
- A4 portrait aspect ratio (595:842 or 1:√2)
- Scale simulation coordinates to fit canvas
- Draw continuous line through paint points
- Stroke style: configurable color, width
- Background: white or subtle texture

**Features:**
- Responsive sizing (fit container)
- High DPI support (devicePixelRatio scaling)

### `DebugCanvas.vue`

**Overflow visualization.**

**Props:**
- `paintPoints: Point2D[]`
- `a4Bounds: { width: number; height: number }`

**Rendering:**
- Larger canvas showing area beyond A4 bounds
- Draw A4 rectangle outline
- Draw all paint points (including those outside A4)
- Different color for out-of-bounds points

**Purpose:** Help user tune parameters to keep art within desired canvas.

## Styling

- Card-based design: Each component panel has border, padding, subtle shadow
- Consistent spacing: Use CSS variables for margins, gaps
- Responsive: Sidebar stacks above main area on narrow screens
- Dark/light mode: Prepare CSS custom properties for theming (future)

## Component Communication

- **Downward**: Props from App → children
- **Upward**: Events for user actions (emit to App)
- **Shared state**: Via composable (provided in App, consumed anywhere)

No direct sibling communication; all through parent or shared composable.

## File Organization

```
/components
  /controls
    ControlPanel.vue
    ParameterControls.vue
    SimulationControls.vue
  /debug
    TopDownView.vue
    SideView.vue
    StateDisplay.vue
  /canvas
    PaintCanvas.vue
    DebugCanvas.vue
  Sidebar.vue
```

## Incremental Development

**Phase 1:**
- Minimal ControlPanel (just reset button)
- Single diagnostic view (top-down)
- Basic PaintCanvas

**Phase 2:**
- Full parameter controls
- Add SideView, StateDisplay
- Instant vs real-time modes

**Phase 3:**
- DebugCanvas
- Presets
- SVG export

**Phase 4:**
- Polish styling
- Advanced features (color, multi-pendulum)
