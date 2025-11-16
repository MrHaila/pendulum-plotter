<template>
	<div>
		<h3 class="text-sm font-semibold mb-3 text-gray-700">Side View (XY)</h3>
		<div ref="containerRef" class="w-full">
			<canvas
				ref="canvasRef"
				:width="canvasSize"
				:height="canvasSize"
				class="border border-gray-300 bg-gray-50 w-full"
				:style="{ aspectRatio: '1' }"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Vec3 } from '@/types'

const props = defineProps<{
	position3D: Vec3
	ropeLength: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const canvasSize = ref(400)

const updateSize = () => {
	if (!containerRef.value) return
	const width = containerRef.value.offsetWidth
	// Use 2x for retina/high-DPI displays
	canvasSize.value = width * 2
}

const draw = () => {
	const canvas = canvasRef.value
	if (!canvas) return

	const ctx = canvas.getContext('2d')
	if (!ctx) return

	const size = canvasSize.value
	const centerX = size / 2
	const topY = 40
	const scale = (size * 0.8) / props.ropeLength

	// Clear
	ctx.clearRect(0, 0, size, size)

	// Draw suspension point crosshair
	ctx.beginPath()
	ctx.moveTo(centerX - 10, topY)
	ctx.lineTo(centerX + 10, topY)
	ctx.moveTo(centerX, topY - 10)
	ctx.lineTo(centerX, topY + 10)
	ctx.strokeStyle = '#9ca3af'
	ctx.lineWidth = 1
	ctx.stroke()

	// Draw ground line
	const groundY = topY + props.ropeLength * scale
	ctx.beginPath()
	ctx.moveTo(0, groundY)
	ctx.lineTo(size, groundY)
	ctx.strokeStyle = '#9ca3af'
	ctx.lineWidth = 2
	ctx.setLineDash([5, 5])
	ctx.stroke()
	ctx.setLineDash([])

	// Draw rope
	const x = centerX + props.position3D.x * scale
	const y = topY + props.position3D.y * scale

	ctx.beginPath()
	ctx.moveTo(centerX, topY)
	ctx.lineTo(x, y)
	ctx.strokeStyle = '#3b82f6'
	ctx.lineWidth = 2
	ctx.stroke()

	// Draw bucket with depth cues
	// Size based on Z (depth): closer to camera (higher Z) = bigger
	const zNormalized = Math.max(-1, Math.min(1, props.position3D.z / props.ropeLength))
	const sizeScale = 1.8 + zNormalized * 0.8 // 1.8 to 2.6 scale
	const bucketRadius = 6 * sizeScale

	// Darkness based on Y (height): Y-axis points down, so higher Y = closer to ground = darker
	// Y ranges from ~0 (at suspension) to ropeLength (fully extended down)
	const yNormalized = Math.max(0, Math.min(1, props.position3D.y / props.ropeLength))
	const lightness = 80 - yNormalized * 40 // 80% (light, top) to 50% (dark, bottom)

	ctx.beginPath()
	ctx.arc(x, y, bucketRadius, 0, Math.PI * 2)
	ctx.fillStyle = `hsl(0, 84%, ${lightness}%)`
	ctx.fill()
}

// Resize observer to update canvas size
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
	updateSize()
	draw()

	// Watch for container size changes
	if (containerRef.value) {
		resizeObserver = new ResizeObserver(() => {
			updateSize()
			draw()
		})
		resizeObserver.observe(containerRef.value)
	}
})

onUnmounted(() => {
	if (resizeObserver) {
		resizeObserver.disconnect()
	}
})

watch(() => [props.position3D, props.ropeLength], draw, { deep: true })
watch(canvasSize, draw)
</script>
