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
