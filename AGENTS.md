# Pendulum Plotter - Project Overview

## Vision

An interactive creative art tool that simulates a paint bucket swinging on a spherical pendulum in 3D space, continuously dripping paint onto a 2D canvas below. The result is a generative art piece where complex 3D physics produce beautiful 2D patterns.

## Core Concept

1. **Spherical pendulum**: A bucket suspended by a rope, free to swing in any direction (not confined to a single plane)
2. **Continuous paint drips**: Every simulation frame, paint drips from the bucket
3. **3D to 2D projection**: Each drip follows gravity vertically downward until it intersects the horizontal ground plane
4. **2D trail**: The intersection points create a continuous line drawing on the canvas

## Creative Goals

- Explore the relationship between 3D motion and 2D output
- Make complex physics accessible and visually engaging
- Enable experimentation with different parameters to discover patterns
- Create exportable artwork (SVG format, A4 size)

## User Experience

### Layout

- **Left sidebar**: Controls and diagnostic visualizations
- **Right area**: Main canvas (A4 portrait simulation)

### Diagnostic Views

Multiple card-style components showing:

- **Top-down view**: XZ plane projection (bird's eye)
- **Side view**: XY or YZ plane projection
- **Parameter displays**: Current pendulum state (angle, velocity, position)

### Controls

Adjustable parameters:

- Pendulum rope length
- Initial angle/position
- Gravity strength
- Damping/friction
- Simulation speed (for real-time mode)

### Execution Modes

- **Instant**: Calculate entire simulation immediately, display final result
- **Real-time**: Animate the pendulum motion, watch paint trail form

## Output

- Canvas displays continuous paint trail
- Coordinate space: A4 portrait (595pt × 842pt)
- Export as SVG for printing/further editing
- Debug canvas shows overflow (helps tune parameters)

## Iteration Philosophy

Start minimal, add complexity through user feedback:

1. Basic spherical pendulum physics
2. Simple line drawing
3. Add controls iteratively
4. Explore visual styles (line thickness, color, etc.)
5. Advanced features (multiple pendulums, color gradients, etc.)

## Code Style

- Vue 3 Composition API with `<script setup lang="ts">`
- TypeScript strict mode, explicit types
- No semicolons, dangling commas (enforced by Prettier)
- Tailwind CSS v4 for styling (utility-first)
- Prefer const over let, use functional patterns
- Component files: PascalCase.vue
- Utility/core files: camelCase.ts

## Architecture Principles

### Separation of Concerns

**Core logic** (`/src/core`):

- Framework-agnostic physics simulation
- Pure functions, no Vue dependencies
- Export typed interfaces for state
- Testable in isolation

**Vue layer** (`/src/components`, `/src/composables`):

- Components consume core state
- Composables bridge core logic to Vue reactivity
- Multiple views from same simulation state

### State Management

- Single source of truth for simulation state
- Composables provide reactive wrappers
- Components are presentational, not stateful

## Coordinate Systems

**Simulation space**: A4 portrait coordinate system (595pt × 842pt)
**Viewport space**: Browser window (responsive, scaled)
**3D space**: Y-up right-handed (for physics)
**2D projections**: Top-down (XZ plane), Side view (XY or YZ plane)

All coordinate transforms in `/src/utils/coordinates.ts`

## Component Organization

```text
/components
  /debug      # Top-down, side views
  /controls   # Parameter inputs
  /canvas     # Main output, debug canvas
```

Each component card-style, independently iterable.

## Development Workflow

- Start simple, iterate
- Instant simulation mode for debugging
- Real-time mode for visualization
- Test physics calculations independently
- Visual debugging components always visible during dev
- **Always run `pnpm lint` and `pnpm typecheck` after making changes to verify work**

## Testing Approach

- Unit tests for core physics functions
- Visual verification for rendering
- Compare instant vs real-time modes for consistency

## Commit Conventions

Follow existing style: concise, lowercase, imperative mood.

---

## Key Files Reference

### Core Physics (`/src/core`)

#### physics.ts

- `sphericalToCartesian()`: Spherical → 3D Cartesian conversion
- `calculateAccelerations()`: Lagrangian mechanics (theta'', phi'')
- `integrateRK4()`: 4th-order Runge-Kutta timestep integration

#### PendulumSimulator.ts

- Encapsulates simulation state and stepping
- `step()`: Advance + collect paint points
- `reset()`, `updateConfig()`, `getState()`, `getPaintPoints()`

### Composables (`/src/composables`)

#### useSimulation.ts

- Vue reactive bridge to PendulumSimulator
- Modes: `instant` (batch steps) | `realtime` (60 FPS loop)
- Status: `idle` | `running` | `paused` | `completed`
- Exports `canvasPoints` (A4 coords), state, control methods
- Methods: `runInstant()`, `startRealtime()`, `pause()`, `resume()`, `stop()`, `reset()`

#### useBreakpoint.ts

- Responsive detection: `isTooNarrow` (< 1200px)
- Exports `windowWidth`, `minWidth`

### Utilities (`/src/utils`)

#### coordinates.ts

- `groundToCanvas()`: Physics (X,Z) → A4 (595×842pt)
- `simulationToViewport()`: A4 → browser pixels
- `calculateBounds()`: Scale/offset for pendulum in A4 space

#### svg.ts

- `generateSVG()`: Create SVG document from paint points
- `downloadSVG()`: Trigger browser download

### Components

**App.vue** - Root layout (3-column: controls | canvas | diagnostics), orchestrates all events

**canvas/PaintCanvas.vue** - Main output canvas, incremental rendering (only draws new segments)

**controls/ControlPanel.vue** - Mode toggle, playback buttons, export
**controls/InitialParameterControls.vue** - Pre-simulation sliders (rope, gravity, initial conditions)
**controls/RuntimeParameterControls.vue** - Read-only state display during playback

**debug/TopDownView.vue** - XZ plane orthographic view
**debug/SideView.vue** - XY plane orthographic view
**debug/RawDataDisplay.vue** - Overlay grid of raw point coords

**NarrowScreenMessage.vue** - Responsive breakpoint message

### Types (`/src/types/index.ts`)

- `Vec2`, `Vec3`: Vector types
- `PendulumState`: theta, phi, angular velocities, time
- `SimulationConfig`: rope length, gravity, damping, initial conditions
- `BoundsConfig`: Canvas scaling
