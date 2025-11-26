<template>
	<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
		<canvas
			ref="canvasRef"
			:width="canvasWidth"
			:height="canvasHeight"
			class="rounded-lg"
			:style="{ width: displayWidth + 'px', height: displayHeight + 'px' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { Vec3, BoundsConfig } from '@/types'
import { simulationToViewport, groundToCanvas } from '@/utils/coordinates'

const props = defineProps<{
	position3D: Vec3
	ropeLength: number
	bounds: BoundsConfig
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Match PaintCanvas sizing logic
const dpr = window.devicePixelRatio || 1
const baseSize = 600

const isLandscape = computed(() => props.bounds.canvasWidth > props.bounds.canvasHeight)
const aspectRatio = computed(() => props.bounds.canvasHeight / props.bounds.canvasWidth)

const baseWidth = computed(() => (isLandscape.value ? baseSize / aspectRatio.value : baseSize))
const baseHeight = computed(() => (isLandscape.value ? baseSize : baseSize * aspectRatio.value))

const canvasWidth = computed(() => baseWidth.value * dpr)
const canvasHeight = computed(() => baseHeight.value * dpr)
const displayWidth = baseWidth
const displayHeight = baseHeight

const draw = () => {
	const canvas = canvasRef.value
	if (!canvas) return

	const ctx = canvas.getContext('2d')
	if (!ctx) return

	// Clear
	ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

	// Transform center (0, 0) through the same pipeline as paint points
	const centerCanvas = groundToCanvas(0, 0, props.bounds)
	const centerViewport = simulationToViewport(centerCanvas, canvasWidth.value, canvasHeight.value, props.bounds)

	// Calculate scale: how many pixels per meter (same as bounds.scale but in viewport pixels)
	const pixelsPerMeter = props.bounds.scale * (canvasHeight.value / props.bounds.canvasHeight)
	const boundaryRadius = props.ropeLength * pixelsPerMeter

	// Draw boundary circle with dashed styling
	ctx.beginPath()
	ctx.arc(centerViewport.x, centerViewport.y, boundaryRadius, 0, Math.PI * 2)
	ctx.strokeStyle = '#8d7a65'
	ctx.lineWidth = 2 * dpr
	ctx.setLineDash([5 * dpr, 5 * dpr])
	ctx.stroke()
	ctx.setLineDash([])

	// Draw center cross
	const crossSize = 10 * dpr
	ctx.beginPath()
	ctx.moveTo(centerViewport.x - crossSize, centerViewport.y)
	ctx.lineTo(centerViewport.x + crossSize, centerViewport.y)
	ctx.moveTo(centerViewport.x, centerViewport.y - crossSize)
	ctx.lineTo(centerViewport.x, centerViewport.y + crossSize)
	ctx.strokeStyle = '#8d7a65'
	ctx.lineWidth = 1 * dpr
	ctx.stroke()

	// Transform pendulum position through same pipeline: 3D (x, z) -> canvas -> viewport
	const pendulumCanvas = groundToCanvas(props.position3D.x, props.position3D.z, props.bounds)
	const pendulumViewport = simulationToViewport(pendulumCanvas, canvasWidth.value, canvasHeight.value, props.bounds)

	// Draw rope from center to pendulum
	ctx.beginPath()
	ctx.moveTo(centerViewport.x, centerViewport.y)
	ctx.lineTo(pendulumViewport.x, pendulumViewport.y)
	ctx.strokeStyle = '#6b7280'
	ctx.lineWidth = 2 * dpr
	ctx.stroke()

	// Position dot with depth cues
	const yNormalized = Math.max(0, Math.min(1, props.position3D.y / props.ropeLength))
	const sizeScale = 2.6 - yNormalized * 1.4
	const dotRadius = 6 * dpr * sizeScale

	const lightness = 80 - yNormalized * 40

	ctx.beginPath()
	ctx.arc(pendulumViewport.x, pendulumViewport.y, dotRadius, 0, Math.PI * 2)
	ctx.fillStyle = `hsl(28, 90%, ${lightness}%)`
	ctx.fill()
}

onMounted(() => {
	draw()
})

watch(() => [props.position3D, props.ropeLength, props.bounds], draw, { deep: true })
watch([canvasWidth, canvasHeight], draw)
</script>
