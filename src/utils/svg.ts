import type { Point2D, BoundsConfig } from '@/types'

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
 * Generate complete SVG document with dynamic canvas dimensions
 */
export function generateSVG(points: Point2D[], bounds: BoundsConfig): string {
	const path = paintPointsToSVGPath(points)

	return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
	width="${bounds.canvasWidth}pt"
	height="${bounds.canvasHeight}pt"
	viewBox="0 0 ${bounds.canvasWidth} ${bounds.canvasHeight}"
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
export function downloadSVG(points: Point2D[], bounds: BoundsConfig, filename = 'pendulum-plotter.svg'): void {
	const svgContent = generateSVG(points, bounds)
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
