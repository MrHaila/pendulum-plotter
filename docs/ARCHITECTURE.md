# System Architecture

## Design Principles

### Separation of Business Logic and Rendering

**Goal**: Physics simulation should be independent of Vue/DOM, enabling:
- Unit testing without rendering
- Different visualization approaches
- Potential reuse in other contexts (Node.js, web workers, etc.)

### Core Layer (`/src/core`)

Framework-agnostic TypeScript modules.

**Responsibilities:**
- Pendulum state representation
- Physics calculations (equations of motion)
- Numerical integration (RK4)
- Simulation stepping (instant or incremental)

**Example structure:**
```typescript
// core/types.ts
export interface PendulumState { ... }
export interface SimulationConfig { ... }

// core/physics.ts
export function calculateAccelerations(state: PendulumState, config: SimulationConfig): {...}
export function integrateRK4(state: PendulumState, dt: number, config: SimulationConfig): PendulumState

// core/simulator.ts
export class PendulumSimulator {
  step(): void
  reset(): void
  getState(): PendulumState
  getPaintPoints(): Point2D[]
}
```

**No Vue imports in `/src/core`**.

### Vue Layer

#### Composables (`/src/composables`)

Bridge between core logic and Vue reactivity.

```typescript
// composables/useSimulation.ts
export function useSimulation(config: SimulationConfig) {
  const simulator = new PendulumSimulator(config)
  const state = ref<PendulumState>(simulator.getState())
  const paintPoints = ref<Point2D[]>([])

  function step() {
    simulator.step()
    state.value = simulator.getState()
    paintPoints.value = simulator.getPaintPoints()
  }

  function runInstant(steps: number) {
    for (let i = 0; i < steps; i++) simulator.step()
    state.value = simulator.getState()
    paintPoints.value = simulator.getPaintPoints()
  }

  return { state, paintPoints, step, runInstant, reset: () => simulator.reset() }
}
```

#### Components (`/src/components`)

Presentational components consuming reactive state.

**Props in, events out pattern**:
- Receive state via props or composables
- Emit user interactions
- No direct manipulation of simulation logic

### State Management

**Single source of truth**: Composable provides shared reactive state.

```
App.vue
  ├─ useSimulation() composable (single instance)
  ├─ ControlPanel (modifies config, triggers reset)
  ├─ DiagnosticViews
  │   ├─ TopDownView (reads state)
  │   └─ SideView (reads state)
  └─ CanvasOutput
      ├─ MainCanvas (reads paintPoints)
      └─ DebugCanvas (reads paintPoints + boundary info)
```

## Data Flow

### Instant Mode
1. User sets parameters in controls
2. Click "Generate"
3. Composable runs N simulation steps synchronously
4. All components update reactively with final result

### Real-time Mode
1. User sets parameters, clicks "Start"
2. `requestAnimationFrame` loop calls `step()` each frame
3. State updates incrementally
4. Components re-render each frame (watch pendulum move)

## Utilities (`/src/utils`)

Helper functions for:
- **Coordinate transforms**: 3D spherical ↔ Cartesian, Cartesian → 2D projections
- **Canvas scaling**: Simulation space (A4) ↔ viewport pixels
- **SVG export**: Convert paint points to SVG path

```typescript
// utils/coordinates.ts
export function sphericalToCartesian(theta, phi, r): Vec3
export function projectTopDown(vec3: Vec3): Vec2
export function projectSideView(vec3: Vec3, axis: 'x' | 'z'): Vec2

// utils/canvas.ts
export function canvasToSimulationCoords(canvasX, canvasY, canvasWidth, canvasHeight): Vec2
export function simulationToCanvasCoords(simX, simY, canvasWidth, canvasHeight): Vec2

// utils/svg.ts
export function paintPointsToSVGPath(points: Point2D[]): string
```

## TypeScript Types (`/src/types`)

Shared type definitions.

```typescript
// types/simulation.ts
export interface PendulumState { ... }
export interface SimulationConfig { ... }

// types/geometry.ts
export interface Vec2 { x: number; y: number }
export interface Vec3 { x: number; y: number; z: number }
export interface Point2D { x: number; y: number }
```

## Testing Strategy

- **Core layer**: Unit tests for physics functions, integration accuracy
- **Composables**: Test state updates, instant vs real-time consistency
- **Components**: Visual/snapshot testing, prop validation
- **Utils**: Test coordinate transforms with known values

## Performance Considerations

- Instant mode: Potentially thousands of steps, keep simulation logic lean
- Real-time mode: Target 60fps, profile rendering if slow
- Canvas optimization: Use `Path2D` API, avoid re-drawing entire history each frame
- Consider web worker for heavy instant simulations (future optimization)
