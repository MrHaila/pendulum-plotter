<template>
	<div class="relative">
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
import type { Point2D, BoundsConfig } from '@/types'
import { simulationToViewport } from '@/utils/coordinates'

const props = defineProps<{
	points: Point2D[]
	bounds: BoundsConfig
	showPlaceholder?: boolean
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

// Track last drawn point count for incremental rendering
let lastDrawnCount = 0
// Track first point to detect array content changes (not just length)
let lastFirstPointKey: string | null = null

// Configure canvas context styles once
const configureContext = (ctx: CanvasRenderingContext2D) => {
	// Stroke color adapts to theme: charcoal in light mode, warm light in dark mode
	const isDark = document.documentElement.classList.contains('dark')
	ctx.strokeStyle = isDark ? '#b8a691' : '#2b2014' // base-400 in dark, base-900 in light
	ctx.lineWidth = 2 * dpr
	ctx.lineCap = 'round'
	ctx.lineJoin = 'round'
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
		const startIdx = Math.max(1, lastDrawnCount)
		for (let i = startIdx; i < points.length; i++) {
			const prevPoint = simulationToViewport(points[i - 1], canvasWidth.value, canvasHeight.value, props.bounds)
			const currPoint = simulationToViewport(points[i], canvasWidth.value, canvasHeight.value, props.bounds)

			ctx.beginPath()
			ctx.moveTo(prevPoint.x, prevPoint.y)
			ctx.lineTo(currPoint.x, currPoint.y)
			ctx.stroke()
		}
	}

	lastDrawnCount = points.length
}

// Redraw when points change
watch(() => props.points.length, draw)

// Reset canvas when bounds change (aspect ratio changes)
watch(
	() => props.bounds,
	() => {
		lastDrawnCount = 0
		lastFirstPointKey = null
		draw()
	},
	{ deep: true },
)

// Watch for theme changes and force redraw
const themeObserver = new MutationObserver(() => {
	// Force full redraw when theme changes
	lastDrawnCount = 0
	lastFirstPointKey = null
	draw()
})

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
