import type { Point2D } from '@/types'
import { A4_WIDTH, A4_HEIGHT } from './coordinates'

/**
 * Convert array of Point2D to SVG path string
 */
export function paintPointsToSVGPath(points: Point2D[]): string {
	if (points.length === 0) return ''

	// Start with M (move to) for first point
	const pathParts: string[] = [`M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)}`]

	// Add L (line to) for remaining points
	for (let i = 1; i < points.length; i++) {
		pathParts.push(`L ${points[i].x.toFixed(3)} ${points[i].y.toFixed(3)}`)
	}

	return pathParts.join(' ')
}

/**
 * Generate complete SVG document with A4 dimensions (595x842 points at 72 DPI)
 */
export function generateSVG(points: Point2D[]): string {
	const path = paintPointsToSVGPath(points)

	return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
	width="${A4_WIDTH}pt"
	height="${A4_HEIGHT}pt"
	viewBox="0 0 ${A4_WIDTH} ${A4_HEIGHT}"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
>
	<g id="pendulum-trail">
		<path
			d="${path}"
			fill="none"
			stroke="#000000"
			stroke-width="0.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</g>
</svg>`
}

/**
 * Trigger browser download of SVG file
 */
export function downloadSVG(points: Point2D[], filename = 'pendulum-plotter.svg'): void {
	const svgContent = generateSVG(points)
	const blob = new Blob([svgContent], { type: 'image/svg+xml' })
	const url = URL.createObjectURL(blob)

	const link = document.createElement('a')
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)

	// Clean up the URL object
	URL.revokeObjectURL(url)
}
