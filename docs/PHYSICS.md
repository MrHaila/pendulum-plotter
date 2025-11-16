# Spherical Pendulum Physics

## Overview

A spherical pendulum (or 3D pendulum) is a mass suspended by a fixed-length rope, free to swing in any direction. Unlike a simple 2D pendulum (which oscillates in a single plane), it can trace complex paths like circles, ellipses, and Lissajous-like figures.

## Coordinate System

**Right-handed 3D space:**
- Origin: Suspension point (where rope attaches to ceiling)
- Y-axis: Vertical (positive = down, towards ground)
- X-axis: Horizontal right
- Z-axis: Horizontal forward (towards viewer)

**Ground plane:** Y = `ropeLength` (horizontal surface where paint lands)

## State Variables

```typescript
interface PendulumState {
  // Spherical coordinates (relative to suspension point)
  theta: number   // Azimuthal angle (rotation around Y-axis), radians
  phi: number     // Polar angle (angle from vertical), radians

  // Angular velocities
  thetaDot: number  // Rate of change of theta
  phiDot: number    // Rate of change of phi

  // Time
  t: number
}
```

## Equations of Motion

Spherical pendulum dynamics using Lagrangian mechanics:

### Angular accelerations

```
θ̈ = -2(φ̇)(θ̇)cot(φ) + (g/L)sin(θ)sin(φ)cos(φ)
φ̈ = sin(φ)cos(φ)(θ̇)² - (g/L)sin(φ)cos(θ)
```

Where:
- `L` = rope length
- `g` = gravitational acceleration
- `θ` (theta) = azimuthal angle
- `φ` (phi) = polar angle from vertical

### Damping

Add friction/air resistance:

```
θ̈ += -b₁·θ̇
φ̈ += -b₂·φ̇
```

Where `b₁, b₂` are damping coefficients.

## Integration

Use **4th-order Runge-Kutta (RK4)** for numerical integration:
- More accurate than Euler method
- Stable for oscillatory systems
- Fixed time step `dt`

## Cartesian Conversion

From spherical to Cartesian coordinates (for rendering):

```
x = L·sin(φ)·sin(θ)
y = L·cos(φ)
z = L·sin(φ)·cos(θ)
```

## Paint Drip Calculation

At each timestep:
1. Get bucket position in Cartesian: `(x, y, z)`
2. Paint falls straight down: direction = `(0, 1, 0)`
3. Ground plane intersection: Y = `L` (assuming ground at rope length distance)
4. Since drip is vertical, intersection point: `(x, L, z)`
5. Project to 2D canvas: use X and Z coordinates

## Parameters

### Required
- `ropeLength`: Distance from origin to bucket (meters or abstract units)
- `gravity`: Gravitational acceleration (m/s² or abstract)
- `timestep`: Integration step size (seconds)

### Optional
- `dampingTheta`: Damping for azimuthal motion
- `dampingPhi`: Damping for polar motion

### Initial Conditions
- `initialTheta`: Starting azimuthal angle
- `initialPhi`: Starting polar angle from vertical
- `initialThetaDot`: Starting angular velocity (theta)
- `initialPhiDot`: Starting angular velocity (phi)

## Edge Cases

- **Phi approaching 0 or π**: Pendulum near vertical (singularity in spherical coords)
  - Limit `cot(phi)` to prevent numerical instability
- **Very small timestep**: More accurate but slower
- **Very large initial energy**: May exceed physical bounds, clamp velocities if needed

## Simplified Initial Implementation

For MVP, can start with small-angle approximation or restrict initial conditions to avoid singularities. Full nonlinear equations can be refined in later iterations.
