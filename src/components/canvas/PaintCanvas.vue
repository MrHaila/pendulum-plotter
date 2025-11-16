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
import { ref, watch, onMounted, computed } from 'vue'
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

// Scale points from A4 space to canvas viewport
const viewportPoints = computed(() => {
	return props.points.map(p => simulationToViewport(p, canvasWidth, canvasHeight))
})

// Draw paint trail
const draw = () => {
	const canvas = canvasRef.value
	if (!canvas) return

	const ctx = canvas.getContext('2d')
	if (!ctx) return

	// Clear canvas
	ctx.clearRect(0, 0, canvasWidth, canvasHeight)

	// Draw paint trail
	if (viewportPoints.value.length < 2) return

	ctx.beginPath()
	ctx.moveTo(viewportPoints.value[0].x, viewportPoints.value[0].y)

	for (let i = 1; i < viewportPoints.value.length; i++) {
		ctx.lineTo(viewportPoints.value[i].x, viewportPoints.value[i].y)
	}

	ctx.strokeStyle = '#000000'
	ctx.lineWidth = 2 * dpr
	ctx.lineCap = 'round'
	ctx.lineJoin = 'round'
	ctx.stroke()
}

// Redraw when points change
watch(() => props.points, draw, { deep: true })

// Initial draw
onMounted(draw)
</script>
