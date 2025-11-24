import type { Point2D, BoundsConfig, CanvasShape } from '@/types'

// A4 dimensions in points (at 72 DPI)
export const A4_WIDTH = 595
export const A4_HEIGHT = 842

// Canvas shape configurations
export const CANVAS_SHAPES: Record<CanvasShape, { width: number; height: number; description: string }> = {
	'16x9-portrait': { width: 1080, height: 1920, description: '9:16' },
	'a4-portrait': { width: A4_WIDTH, height: A4_HEIGHT, description: 'A4 Portrait' },
	'square-center': { width: 1024, height: 1024, description: 'Square (Centered)' },
	'a4-landscape': { width: A4_HEIGHT, height: A4_WIDTH, description: 'A4 Landscape' },
	'16x9-landscape': { width: 1920, height: 1080, description: '16:9' },
}

/**
 * Transform 3D ground point (X, Z) to canvas 2D coordinates
 * Centers and scales the physics space to fit within canvas bounds
 */
export function groundToCanvas(x: number, z: number, bounds: BoundsConfig): Point2D {
	return {
		x: bounds.canvasWidth / 2 + (x - bounds.centerX) * bounds.scale,
		y: bounds.canvasHeight / 2 + (z - bounds.centerZ) * bounds.scale,
	}
}

/**
 * Transform simulation coordinates to viewport pixel coordinates
 * Scales from logical canvas space to actual canvas size
 */
export function simulationToViewport(
	simPoint: Point2D,
	canvasWidth: number,
	canvasHeight: number,
	bounds: BoundsConfig,
): Point2D {
	return {
		x: (simPoint.x / bounds.canvasWidth) * canvasWidth,
		y: (simPoint.y / bounds.canvasHeight) * canvasHeight,
	}
}

/**
 * Transform viewport pixel coordinates to simulation coordinates
 * Inverse of simulationToViewport, useful for mouse interaction
 */
export function viewportToSimulation(
	pixelPoint: Point2D,
	canvasWidth: number,
	canvasHeight: number,
	bounds: BoundsConfig,
): Point2D {
	return {
		x: (pixelPoint.x / canvasWidth) * bounds.canvasWidth,
		y: (pixelPoint.y / canvasHeight) * bounds.canvasHeight,
	}
}

/**
 * Calculate bounds configuration to fit pendulum motion within canvas
 * Uses dynamic canvas dimensions based on shape
 */
export function calculateBounds(
	ropeLength: number,
	zoom: number = 1.0,
	canvasShape: CanvasShape = 'a4-portrait',
): BoundsConfig {
	const { width, height } = CANVAS_SHAPES[canvasShape]

	// Scale to fit pendulum swing within 80% of the smaller dimension
	const maxSwing = ropeLength * 0.9 // Assuming phi can reach ~90 degrees
	const minDimension = Math.min(width, height)
	const scale = ((minDimension * 0.8) / (2 * maxSwing)) * zoom

	return {
		centerX: 0,
		centerZ: 0,
		scale,
		canvasWidth: width,
		canvasHeight: height,
	}
}
