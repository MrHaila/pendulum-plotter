import type { Point2D, BoundsConfig } from '@/types'

// A4 dimensions in points (at 72 DPI)
export const A4_WIDTH = 595
export const A4_HEIGHT = 842

/**
 * Transform 3D ground point (X, Z) to A4 2D canvas coordinates
 * Centers and scales the physics space to fit within A4 bounds
 */
export function groundToCanvas(x: number, z: number, bounds: BoundsConfig): Point2D {
	return {
		x: A4_WIDTH / 2 + (x - bounds.centerX) * bounds.scale,
		y: A4_HEIGHT / 2 + (z - bounds.centerZ) * bounds.scale,
	}
}

/**
 * Transform A4 simulation coordinates to viewport pixel coordinates
 * Scales from logical A4 space to actual canvas size
 */
export function simulationToViewport(simPoint: Point2D, canvasWidth: number, canvasHeight: number): Point2D {
	return {
		x: (simPoint.x / A4_WIDTH) * canvasWidth,
		y: (simPoint.y / A4_HEIGHT) * canvasHeight,
	}
}

/**
 * Transform viewport pixel coordinates to A4 simulation coordinates
 * Inverse of simulationToViewport, useful for mouse interaction
 */
export function viewportToSimulation(pixelPoint: Point2D, canvasWidth: number, canvasHeight: number): Point2D {
	return {
		x: (pixelPoint.x / canvasWidth) * A4_WIDTH,
		y: (pixelPoint.y / canvasHeight) * A4_HEIGHT,
	}
}

/**
 * Calculate bounds configuration to fit pendulum motion within A4
 * For now, use fixed scale based on rope length
 */
export function calculateBounds(ropeLength: number): BoundsConfig {
	// Scale to fit pendulum swing within 80% of A4 width
	const maxSwing = ropeLength * 0.9 // Assuming phi can reach ~90 degrees
	const scale = (A4_WIDTH * 0.8) / (2 * maxSwing)

	return {
		centerX: 0,
		centerZ: 0,
		scale,
	}
}
