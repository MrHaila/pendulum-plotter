# Implementation Roadmap

## Development Philosophy

**Incremental iteration:** Start with minimal viable product, add features based on testing and exploration.

**Working software first:** Each phase should result in a functional, demonstrable application.

**Flexibility:** Plans will evolve as we discover what works visually and technically.

---

## Phase 5: Polish & Refinement

**Goal:** Improve visual styling, usability, and performance.

### Tasks

#### Visual Design

- [ ] Refine component styling:
  - Card-based design with shadows, borders
  - Consistent spacing and typography that prioritizes content over structure (smaller titles, etc.)
  - Color palette (background, text, accents)
- [x] Responsive layout:
  - Block layout on narrow screens with a helpful message.

#### Performance Optimization

- [x] Optimize canvas rendering (avoid redrawing full trail each frame)

#### Usability

- [ ] Keyboard shortcuts (Space = start/stop, R = reset, E = export)
- [ ] Help/info for parameters

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

**Active Phase:** Phase 3 (complete)

**Next Steps:** Begin Phase 4 (SVG Export & Presets)
