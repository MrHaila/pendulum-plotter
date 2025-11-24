import type { Point2D, BoundsConfig } from '@/types'
import { simulationToViewport } from './coordinates'

/**
 * Render points to canvas and export as PNG
 */
export function downloadPNG(
	points: Point2D[],
	bounds: BoundsConfig,
	filename = 'pendulum-plotter.png',
	scale = 2, // Export at 2x resolution for quality
): void {
	if (points.length < 2) {
		console.warn('Not enough points to export PNG')
		return
	}

	// Create offscreen canvas at canvas dimensions scaled up
	const canvas = document.createElement('canvas')
	const width = bounds.canvasWidth * scale
	const height = bounds.canvasHeight * scale
	canvas.width = width
	canvas.height = height

	const ctx = canvas.getContext('2d')
	if (!ctx) {
		console.error('Failed to get canvas context')
		return
	}

	// Draw paper background (warm cream in light mode)
	const gradient = ctx.createLinearGradient(0, 0, width, height)
	gradient.addColorStop(0, '#fdfcfb')
	gradient.addColorStop(1, '#f7f4ef')
	ctx.fillStyle = gradient
	ctx.fillRect(0, 0, width, height)

	// Configure stroke style
	ctx.strokeStyle = '#2b2014' // base-900
	ctx.lineWidth = 2 * scale
	ctx.lineCap = 'round'
	ctx.lineJoin = 'round'

	// Draw path
	ctx.beginPath()
	for (let i = 0; i < points.length; i++) {
		const point = simulationToViewport(points[i], width, height, bounds)
		if (i === 0) {
			ctx.moveTo(point.x, point.y)
		} else {
			ctx.lineTo(point.x, point.y)
		}
	}
	ctx.stroke()

	// Convert to blob and download
	canvas.toBlob(blob => {
		if (!blob) {
			console.error('Failed to create PNG blob')
			return
		}

		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}, 'image/png')
}
