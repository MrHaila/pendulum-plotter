<template>
	<div class="relative" :style="canvasContainerStyle">
		<canvas
			ref="canvasRef"
			:width="canvasWidth"
			:height="canvasHeight"
			class="border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] shadow-[0_4px_8px_rgba(69,40,20,0.1),0_2px_4px_rgba(69,40,20,0.06)] rounded-lg canvas-paper"
			:style="{ width: displayWidth + 'px', height: displayHeight + 'px' }"
		/>
		<div v-if="showPlaceholder" class="absolute inset-0 p-10 pointer-events-none content-center">
			<div class="text-base-900 dark:text-[#f2e7da] font-semibold tracking-tight leading-relaxed quote-overlay">
				<div class="text-[140px] leading-6 text-[#a54f2a]">&ldquo;</div>
				<div class="text-lg space-y-5">
					<p>I do not trust fate. I control it.</p>
					<p>I dial in the experiment, press <span class="text-accent-primary-300">start</span>, and watch.</p>
					<!-- <p>The pendulum swings, dripping color, sketching a geometry that feels both alien and primal.</p>
					<p>The pendulum swings, drawing a rhythm, tracing truth.</p> -->
					<p>The pendulum swings, and I watch, and I record.</p>
					<p>I clean up my data.</p>
					<p>And then I <span class="text-accent-primary-300">export</span>.</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import type { CanvasPaintPoint, BoundsConfig, StrokeStyleConfig } from '@/types'
import { simulationToViewport } from '@/utils/coordinates'

const props = defineProps<{
	points: CanvasPaintPoint[]
	bounds: BoundsConfig
	strokeStyle: StrokeStyleConfig
	showPlaceholder?: boolean
	canvasOffset?: number
	isAnimating?: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Canvas backing store dimensions (high DPI) - reactive to bounds changes
const dpr = window.devicePixelRatio || 1
const baseSize = 600 // Base size for the constrained dimension

// Detect orientation and calculate dimensions accordingly
const isLandscape = computed(() => props.bounds.canvasWidth > props.bounds.canvasHeight)
const aspectRatio = computed(() => props.bounds.canvasHeight / props.bounds.canvasWidth)

// For landscape: fixed height, calculate width. For portrait: fixed width, calculate height
const baseWidth = computed(() => (isLandscape.value ? baseSize / aspectRatio.value : baseSize))
const baseHeight = computed(() => (isLandscape.value ? baseSize : baseSize * aspectRatio.value))

const canvasWidth = computed(() => baseWidth.value * dpr)
const canvasHeight = computed(() => baseHeight.value * dpr)
const displayWidth = baseWidth
const displayHeight = baseHeight

// Calculate visual offset for canvas swing animation
// Convert simulation offset (meters) to screen pixels
const canvasContainerStyle = computed(() => {
	if (!props.isAnimating || !props.canvasOffset) {
		return {}
	}
	// canvasOffset is in meters (physical displacement)
	// 1. Convert meters to canvas points: meters * bounds.scale
	// 2. Convert canvas points to screen pixels: canvasPoints * (displayHeight / bounds.canvasHeight)
	// 3. Invert: when canvas is higher (positive offset), paint lands lower, so visual moves opposite
	const metersToPixels = props.bounds.scale * (displayHeight.value / props.bounds.canvasHeight)
	const offsetPx = -props.canvasOffset * metersToPixels
	return {
		transform: `translateY(${offsetPx}px)`,
	}
})

// Track last drawn point count for incremental rendering
let lastDrawnCount = 0
// Track first point to detect array content changes (not just length)
let lastFirstPointKey: string | null = null

// Compute min/max speed from all points for normalization
const computeSpeedRange = () => {
	const points = props.points
	if (points.length === 0) return { min: 0, max: 1 }
	let min = Infinity
	let max = -Infinity
	for (const p of points) {
		if (p.speed < min) min = p.speed
		if (p.speed > max) max = p.speed
	}
	return { min, max: max === min ? min + 1 : max }
}

// Map speed to output value with optional inversion
const mapSpeedToValue = (
	speed: number,
	minSpeed: number,
	maxSpeed: number,
	outMin: number,
	outMax: number,
	invert: boolean,
) => {
	if (maxSpeed === minSpeed) return (outMin + outMax) / 2
	let t = (speed - minSpeed) / (maxSpeed - minSpeed) // 0 = slow, 1 = fast
	if (invert) t = 1 - t
	return outMin + t * (outMax - outMin)
}

// Interpolate between two hex colors
const lerpColor = (color1: string, color2: string, t: number): string => {
	const r1 = parseInt(color1.slice(1, 3), 16)
	const g1 = parseInt(color1.slice(3, 5), 16)
	const b1 = parseInt(color1.slice(5, 7), 16)
	const r2 = parseInt(color2.slice(1, 3), 16)
	const g2 = parseInt(color2.slice(3, 5), 16)
	const b2 = parseInt(color2.slice(5, 7), 16)
	const r = Math.round(r1 + (r2 - r1) * t)
	const g = Math.round(g1 + (g2 - g1) * t)
	const b = Math.round(b1 + (b2 - b1) * t)
	return `rgb(${r}, ${g}, ${b})`
}

// Configure canvas context base styles
const configureContext = (ctx: CanvasRenderingContext2D) => {
	ctx.lineCap = 'round'
	ctx.lineJoin = 'round'
}

// Get default stroke color based on theme
const getDefaultStrokeColor = () => {
	const isDark = document.documentElement.classList.contains('dark')
	return isDark ? '#b8a691' : '#2b2014'
}

// Clear canvas and reset tracking state
const clearCanvas = () => {
	const canvas = canvasRef.value
	if (!canvas) return

	const ctx = canvas.getContext('2d')
	if (!ctx) return

	ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
	lastDrawnCount = 0
	lastFirstPointKey = null
}

// Force a complete redraw (clear + draw all points)
const forceFullRedraw = () => {
	clearCanvas()
	draw()
}

// Draw paint trail incrementally (only new segments)
const draw = () => {
	const canvas = canvasRef.value
	if (!canvas) return

	const ctx = canvas.getContext('2d')
	if (!ctx) return

	const points = props.points

	// Compute first point key to detect content changes
	const firstPointKey = points.length > 0 ? `${points[0].x.toFixed(4)},${points[0].y.toFixed(4)}` : null

	// Full redraw on reset (points array shrunk or content fundamentally changed)
	const needsFullRedraw =
		points.length < lastDrawnCount ||
		(lastFirstPointKey !== null && firstPointKey !== null && firstPointKey !== lastFirstPointKey)

	if (needsFullRedraw) {
		ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
		lastDrawnCount = 0
		lastFirstPointKey = null
	}

	// No points yet - nothing to draw
	if (points.length === 0) {
		lastDrawnCount = 0
		lastFirstPointKey = null
		return
	}

	// Track first point for change detection
	if (lastFirstPointKey === null && firstPointKey !== null) {
		lastFirstPointKey = firstPointKey
	}

	// Always configure styles to ensure correct theme colors
	configureContext(ctx)

	// Single point - draw a dot
	if (points.length === 1 && lastDrawnCount === 0) {
		const point = simulationToViewport(points[0], canvasWidth.value, canvasHeight.value, props.bounds)
		ctx.beginPath()
		ctx.arc(point.x, point.y, (2 * dpr) / 2, 0, Math.PI * 2)
		ctx.fill()
		lastDrawnCount = 1
		return
	}

	// Draw only new segments (need at least 2 points for lines)
	if (points.length >= 2) {
		const { min: minSpeed, max: maxSpeed } = computeSpeedRange()
		const style = props.strokeStyle
		const defaultColor = getDefaultStrokeColor()
		const startIdx = Math.max(1, lastDrawnCount)

		for (let i = startIdx; i < points.length; i++) {
			const prevPoint = simulationToViewport(points[i - 1], canvasWidth.value, canvasHeight.value, props.bounds)
			const currPoint = simulationToViewport(points[i], canvasWidth.value, canvasHeight.value, props.bounds)
			const speed = points[i].speed

			// Apply stroke style
			switch (style.type) {
				case 'uniform':
					ctx.strokeStyle = defaultColor
					ctx.lineWidth = style.baseWidth * dpr
					ctx.globalAlpha = 1
					break
				case 'velocity-width': {
					// Fast = thin (minWidth), Slow = thick (maxWidth) unless inverted
					const width = mapSpeedToValue(speed, minSpeed, maxSpeed, style.maxWidth, style.minWidth, style.invertVelocity)
					ctx.strokeStyle = defaultColor
					ctx.lineWidth = width * dpr
					ctx.globalAlpha = 1
					break
				}
				case 'velocity-opacity': {
					// Fast = transparent (minOpacity), Slow = opaque (maxOpacity) unless inverted
					const opacity = mapSpeedToValue(
						speed,
						minSpeed,
						maxSpeed,
						style.maxOpacity,
						style.minOpacity,
						style.invertVelocity,
					)
					ctx.strokeStyle = defaultColor
					ctx.lineWidth = style.baseWidth * dpr
					ctx.globalAlpha = opacity
					break
				}
				case 'velocity-color': {
					// Interpolate between slowColor and fastColor
					const t = (speed - minSpeed) / (maxSpeed - minSpeed)
					ctx.strokeStyle = lerpColor(style.slowColor, style.fastColor, t)
					ctx.lineWidth = style.baseWidth * dpr
					ctx.globalAlpha = 1
					break
				}
			}

			ctx.beginPath()
			ctx.moveTo(prevPoint.x, prevPoint.y)
			ctx.lineTo(currPoint.x, currPoint.y)
			ctx.stroke()
		}

		// Reset alpha after drawing
		ctx.globalAlpha = 1
	}

	lastDrawnCount = points.length
}

// Redraw when points change
watch(() => props.points.length, draw)

// Force full redraw when stroke style changes
watch(() => props.strokeStyle, forceFullRedraw, { deep: true })

// Reset canvas when bounds change (aspect ratio changes)
watch(() => props.bounds, forceFullRedraw, { deep: true })

// Watch for theme changes and force redraw
const themeObserver = new MutationObserver(forceFullRedraw)

// Initial draw
onMounted(() => {
	draw()
	// Observe theme changes
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class'],
	})
})

// Cleanup observer
onBeforeUnmount(() => {
	themeObserver.disconnect()
})
</script>

<style scoped>
.canvas-paper {
	background:
		linear-gradient(135deg, #fdfcfb 0%, #f7f4ef 100%),
		url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
	background-blend-mode: normal, multiply;
}

html.dark .canvas-paper {
	background:
		linear-gradient(135deg, #2b2014 0%, #1f1810 100%),
		url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
	background-blend-mode: normal, overlay;
}

.quote-overlay {
	font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
	font-weight: 500;
}
</style>
