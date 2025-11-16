# Pendulum Plotter - Project Instructions

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

```
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

## Testing Approach

- Unit tests for core physics functions
- Visual verification for rendering
- Compare instant vs real-time modes for consistency

## Commit Conventions

Follow existing style: concise, lowercase, imperative mood.
