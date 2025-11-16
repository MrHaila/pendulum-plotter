# Coordinate Systems and Transformations

## Multiple Coordinate Spaces

The application works with several coordinate systems. Understanding and correctly transforming between them is critical.

---

## 1. Physics Simulation Space (3D)

**Purpose:** Pendulum physics calculations.

**Coordinate system:**
- Right-handed 3D Cartesian
- Origin: Suspension point (ceiling attachment)
- Y-axis: Vertical, positive downward
- X-axis: Horizontal right
- Z-axis: Horizontal forward (towards viewer)

**Units:** Abstract (meters or unitless, consistent within simulation)

**Key positions:**
- Origin `(0, 0, 0)`: Suspension point
- Ground plane: `Y = ropeLength`
- Bucket position: `(x, y, z)` where `y ≤ ropeLength`

**Spherical coordinates (physics):**
- θ (theta): Azimuthal angle, rotation around Y-axis
- φ (phi): Polar angle from vertical (0 = straight down)
- r: Radial distance (= rope length, constant)

---

## 2. A4 Simulation Canvas Space (2D)

**Purpose:** Logical coordinate space for paint output, independent of screen resolution.

**Dimensions:**
- Width: 595 points (A4 width at 72 DPI)
- Height: 842 points (A4 height at 72 DPI)
- Aspect ratio: 1:√2 ≈ 0.707

**Coordinate system:**
- Origin: Top-left corner
- X-axis: Horizontal right (0 to 595)
- Y-axis: Vertical down (0 to 842)

**Units:** Points (1 point = 1/72 inch)

**Mapping from 3D:**
- Paint drips fall from `(x, y, z)` to ground plane `(x, ropeLength, z)`
- X and Z coordinates map to canvas 2D space
- Need to define scale and offset to fit pendulum motion within A4 bounds

**Example mapping:**
```
3D ground point (x, ropeLength, z) → 2D canvas (canvasX, canvasY)

canvasX = (x - minX) / (maxX - minX) * 595
canvasY = (z - minZ) / (maxZ - minZ) * 842
```

(Assumes pendulum motion range is known or bounded)

---

## 3. Viewport Canvas Space (2D, pixels)

**Purpose:** Actual HTML canvas rendering on screen.

**Dimensions:**
- Variable, depends on browser window size and responsive layout
- Maintains A4 aspect ratio (595:842)

**Coordinate system:**
- Origin: Top-left of canvas element
- X-axis: Pixels right
- Y-axis: Pixels down

**HiDPI considerations:**
- `canvas.width` and `canvas.height` (backing store) may differ from CSS size
- Use `devicePixelRatio` to scale canvas for crisp rendering

**Transformation:**
```
A4 point (simX, simY) → Viewport pixel (pixelX, pixelY)

scaleX = canvasWidth / 595
scaleY = canvasHeight / 842

pixelX = simX * scaleX
pixelY = simY * scaleY
```

---

## 4. SVG Export Space (2D)

**Purpose:** Exportable vector graphics at A4 dimensions.

**Dimensions:**
- SVG viewBox: `0 0 595 842` (matches A4 simulation space)
- Physical size: `210mm × 297mm` (A4 in millimeters)

**Coordinate system:**
- Same as A4 simulation space
- Origin: Top-left
- Units: Points (or mm, specified in SVG attributes)

**Conversion:**
- Paint points in A4 simulation space directly map to SVG path coordinates
- No transformation needed if paint points are already in A4 space

**SVG output format:**
```svg
<svg width="210mm" height="297mm" viewBox="0 0 595 842" xmlns="http://www.w3.org/2000/svg">
  <path d="M x1,y1 L x2,y2 L x3,y3 ..." stroke="black" fill="none" stroke-width="2"/>
</svg>
```

---

## Transformation Functions

### 3D Spherical to Cartesian

```typescript
function sphericalToCartesian(theta: number, phi: number, r: number): Vec3 {
  return {
    x: r * Math.sin(phi) * Math.sin(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.cos(theta),
  }
}
```

### 3D Ground Point to 2D Canvas

Assumes pendulum motion is centered and scaled to fit A4.

```typescript
function groundToCanvas(x: number, z: number, config: BoundsConfig): Point2D {
  const { centerX, centerZ, scale } = config
  return {
    x: 595 / 2 + (x - centerX) * scale,
    y: 842 / 2 + (z - centerZ) * scale,
  }
}
```

`BoundsConfig` can be computed from initial conditions or user-specified.

### A4 Simulation to Viewport Pixels

```typescript
function simulationToViewport(simPoint: Point2D, canvasWidth: number, canvasHeight: number): Point2D {
  return {
    x: (simPoint.x / 595) * canvasWidth,
    y: (simPoint.y / 842) * canvasHeight,
  }
}
```

### Viewport Pixels to A4 Simulation (for mouse interaction)

```typescript
function viewportToSimulation(pixelPoint: Point2D, canvasWidth: number, canvasHeight: number): Point2D {
  return {
    x: (pixelPoint.x / canvasWidth) * 595,
    y: (pixelPoint.y / canvasHeight) * 842,
  }
}
```

---

## Debugging Views Coordinate Systems

### Top-Down View (XZ Projection)

- Show XZ plane (bird's eye)
- Origin at center of canvas
- Scale to fit rope length
- Render circle of radius `ropeLength * sin(phi_max)` as boundary

### Side View (XY or YZ Projection)

- Show vertical (Y) vs one horizontal axis
- Origin: Suspension point at top
- Ground line at `Y = ropeLength`
- Scale to show full rope length

---

## Coordinate System Summary

| Space | Dimensions | Origin | Purpose |
|-------|-----------|--------|---------|
| Physics 3D | (x, y, z) | Suspension point | Simulation |
| A4 Canvas 2D | 595 × 842 pt | Top-left | Logical paint space |
| Viewport 2D | Variable px | Top-left | Screen rendering |
| SVG Export | 210 × 297 mm | Top-left | Vector output |
| Top-Down Debug | Variable px | Center | Diagnostic XZ view |
| Side View Debug | Variable px | Top | Diagnostic XY/YZ view |

---

## Implementation Notes

- All coordinate transformations in `/src/utils/coordinates.ts`
- Bounds/scale configuration computed once at simulation start or dynamically updated
- Canvas rendering uses viewport space, stores paint trail in A4 space
- SVG export reads directly from A4-space paint points
