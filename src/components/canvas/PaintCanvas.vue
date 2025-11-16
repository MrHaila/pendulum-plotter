<template>
	<div class="relative">
		<canvas
			ref="canvasRef"
			:width="canvasWidth"
			:height="canvasHeight"
			class="border border-gray-300 shadow-lg bg-white"
			:style="{ width: displayWidth + 'px', height: displayHeight + 'px' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Point2D } from '@/types'
import { A4_WIDTH, A4_HEIGHT, simulationToViewport } from '@/utils/coordinates'

const props = defineProps<{
	points: Point2D[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Canvas backing store dimensions (high DPI)
const dpr = window.devicePixelRatio || 1
const baseWidth = 600 // Base display width in pixels
const baseHeight = Math.floor(baseWidth * (A4_HEIGHT / A4_WIDTH)) // Maintain A4 aspect ratio

const canvasWidth = baseWidth * dpr
const canvasHeight = baseHeight * dpr
const displayWidth = baseWidth
const displayHeight = baseHeight

// Track last drawn point count for incremental rendering
let lastDrawnCount = 0

// Configure canvas context styles once
const configureContext = (ctx: CanvasRenderingContext2D) => {
	ctx.strokeStyle = '#000000'
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

	// Full redraw on reset (points array shrunk)
	if (points.length < lastDrawnCount) {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight)
		lastDrawnCount = 0
	}

	// Need at least 2 points to draw
	if (points.length < 2) return

	// Configure styles once
	if (lastDrawnCount === 0) {
		configureContext(ctx)
	}

	// Draw only new segments
	const startIdx = Math.max(1, lastDrawnCount)
	for (let i = startIdx; i < points.length; i++) {
		const prevPoint = simulationToViewport(points[i - 1], canvasWidth, canvasHeight)
		const currPoint = simulationToViewport(points[i], canvasWidth, canvasHeight)

		ctx.beginPath()
		ctx.moveTo(prevPoint.x, prevPoint.y)
		ctx.lineTo(currPoint.x, currPoint.y)
		ctx.stroke()
	}

	lastDrawnCount = points.length
}

// Redraw when points change
watch(() => props.points.length, draw)

// Initial draw
onMounted(draw)
</script>
