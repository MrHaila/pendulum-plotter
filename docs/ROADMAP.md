# Implementation Roadmap

## Development Philosophy

**Incremental iteration:** Start with minimal viable product, add features based on testing and exploration.

**Working software first:** Each phase should result in a functional, demonstrable application.

**Flexibility:** Plans will evolve as we discover what works visually and technically.

---

## Phase 0: Foundation ✓

**Goal:** Project scaffolding and specifications.

- [x] Git repository initialized
- [x] Vite + Vue 3 + TypeScript setup
- [x] ESLint + Prettier configuration
- [x] Directory structure created
- [x] Documentation written (PROJECT, PHYSICS, ARCHITECTURE, COMPONENTS, COORDINATE_SYSTEM, ROADMAP)
- [x] CLAUDE.md project instructions

---

## Phase 1: Core Physics & Minimal Rendering

**Goal:** Working spherical pendulum simulation with basic paint trail visualization.

### Tasks

#### Core Physics (`/src/core`)

- [ ] Define TypeScript types:
  - `PendulumState` (theta, phi, angular velocities, time)
  - `SimulationConfig` (rope length, gravity, damping, timestep)
  - `Vec2`, `Vec3`, `Point2D` geometry types
- [ ] Implement physics functions:
  - `calculateAccelerations()`: Spherical pendulum equations of motion
  - `integrateRK4()`: 4th-order Runge-Kutta numerical integration
  - `sphericalToCartesian()`: Coordinate conversion
- [ ] Create `PendulumSimulator` class:
  - `step()`: Advance simulation by one timestep
  - `reset()`: Reinitialize to initial conditions
  - `getState()`: Return current state
  - `getPaintPoints()`: Return 2D paint trail (X, Z coordinates on ground)

#### Composables

- [ ] `useSimulation(config)`:
  - Wrap `PendulumSimulator` in reactive refs
  - `step()` method
  - `runInstant(steps)` method
  - `reset()` method

#### Components

- [ ] `App.vue`: Two-column layout, instantiate `useSimulation()`
- [ ] Minimal `ControlPanel.vue`: Reset button only
- [ ] `PaintCanvas.vue`:
  - Canvas element with A4 aspect ratio
  - Draw paint points as continuous line
  - Scale A4 simulation space to canvas pixels

#### Utilities

- [ ] `coordinates.ts`:
  - `sphericalToCartesian()`
  - `groundToCanvas()` (3D ground point → A4 2D)
  - `simulationToViewport()` (A4 → canvas pixels)

### Validation

- Pendulum swings according to physics
- Paint trail visible on canvas
- Reset clears and restarts simulation

---

## Phase 2: Diagnostics & Controls

**Goal:** Add debugging views and parameter controls for exploration.

### Tasks

#### Diagnostic Components

- [ ] `TopDownView.vue`: XZ projection of pendulum position
- [ ] `SideView.vue`: XY or YZ projection showing vertical motion
- [ ] `StateDisplay.vue`: Text readout of current theta, phi, velocities, position, time

#### Enhanced Controls

- [ ] `ParameterControls.vue`:
  - Sliders for rope length, gravity, damping
  - Sliders for initial theta, phi, angular velocities
  - Display current values next to sliders
- [ ] Update `ControlPanel.vue` to include parameter controls

#### Instant Mode

- [ ] Add "Generate" button and step count input
- [ ] Call `runInstant(steps)` when clicked
- [ ] Display final result immediately

### Validation

- Diagnostic views update in sync with simulation
- Changing parameters and resetting produces different patterns
- Instant mode generates complete artwork immediately

---

## Phase 3: Real-time Mode & Debug Canvas

**Goal:** Animated visualization and overflow debugging.

### Tasks

#### Real-time Simulation

- [ ] Add mode toggle: Instant / Real-time
- [ ] Real-time controls: Start, Stop, Pause buttons
- [ ] `requestAnimationFrame` loop in `App.vue`:
  - Call `step()` each frame
  - Limit to reasonable frame rate (e.g., 60fps)
- [ ] Display elapsed time and frame count

#### Debug Canvas

- [ ] `DebugCanvas.vue`:
  - Larger canvas showing area beyond A4 bounds
  - Draw A4 outline
  - Highlight out-of-bounds paint points in different color
- [ ] Help user tune parameters to fit artwork within A4

### Validation

- Watch pendulum swing in real-time
- Paint trail forms progressively
- Debug canvas shows overflow, helps with parameter tuning

---

## Phase 4: SVG Export & Presets

**Goal:** Enable saving artwork and quick exploration of interesting patterns.

### Tasks

#### SVG Export

- [ ] `svg.ts` utility:
  - `paintPointsToSVGPath(points)`: Convert Point2D[] to SVG `<path>` string
  - Generate complete SVG document with A4 dimensions
- [ ] "Export SVG" button in `ControlPanel.vue`
- [ ] Trigger browser download of SVG file

#### Presets

- [ ] Define preset configurations:
  - "Circular": Simple circular swing
  - "Figure-8": Lissajous-like pattern
  - "Chaotic": High energy, complex motion
  - "Spiral": Gradually damping inward
- [ ] Preset selector in `ParameterControls.vue`
- [ ] Load preset on selection

### Validation

- SVG file downloads and opens in vector editor (Illustrator, Inkscape)
- SVG dimensions correct (A4 portrait)
- Presets produce recognizable patterns

---

## Phase 5: Polish & Refinement

**Goal:** Improve visual styling, usability, and performance.

### Tasks

#### Visual Design

- [ ] Refine component styling:
  - Card-based design with shadows, borders
  - Consistent spacing and typography
  - Color palette (background, text, accents)
- [ ] Responsive layout:
  - Stack sidebar above main area on narrow screens
  - Touch-friendly controls

#### Performance Optimization

- [ ] Profile instant mode for large step counts
- [ ] Optimize canvas rendering (avoid redrawing full trail each frame)
- [ ] Consider `Path2D` API or `OffscreenCanvas`
- [ ] Web worker for instant simulation (if needed)

#### Usability

- [ ] Parameter value presets (buttons for common values)
- [ ] Undo/redo for parameter changes (optional)
- [ ] Keyboard shortcuts (Space = start/stop, R = reset, E = export)
- [ ] Help/info tooltips for parameters

#### Testing

- [ ] Unit tests for core physics functions
- [ ] Coordinate transformation tests
- [ ] Visual regression tests (snapshot comparisons)

### Validation

- Smooth, responsive UI
- Fast performance even with thousands of steps
- Polished visual appearance

---

## Phase 6: Advanced Features (Future)

**Ideas for further exploration:**

- Multiple pendulums interacting or drawing simultaneously
- Color gradients based on velocity or time
- Variable stroke width (simulating paint flow rate)
- 3D rendering option (WebGL, Three.js)
- Physics variations (double pendulum, elastic rope, wind)
- Sound generation from motion (sonification)
- Interactive canvas (click to add impulse, drag to adjust initial position)
- Gallery of saved artworks with shareable URLs
- Animation export (GIF, video)

---

## Current Status

**Active Phase:** Phase 0 (complete)

**Next Steps:** Begin Phase 1 (core physics implementation)
