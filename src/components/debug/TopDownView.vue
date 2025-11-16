<template>
	<div>
		<h3 class="text-xs font-display font-light tracking-wider uppercase mb-3 text-base-500 dark:text-base-400">
			Planar Projection: XZ
		</h3>
		<div ref="containerRef" class="w-full">
			<canvas
				ref="canvasRef"
				:width="canvasSize"
				:height="canvasSize"
				class="border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] bg-base-100 dark:bg-base-800 w-full rounded-lg shadow-[0_1px_3px_rgba(69,40,20,0.08)]"
				:style="{ aspectRatio: '1' }"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Point2D, Vec3 } from '@/types'

const props = defineProps<{
	position: Point2D
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
	const center = size / 2
	const scale = (size * 0.8) / (2 * props.ropeLength)

	// Clear
	ctx.clearRect(0, 0, size, size)

	// Draw boundary circle
	ctx.beginPath()
	ctx.arc(center, center, props.ropeLength * scale, 0, Math.PI * 2)
	ctx.strokeStyle = '#e5e7eb'
	ctx.lineWidth = 2
	ctx.stroke()

	// Draw center cross
	ctx.beginPath()
	ctx.moveTo(center - 10, center)
	ctx.lineTo(center + 10, center)
	ctx.moveTo(center, center - 10)
	ctx.lineTo(center, center + 10)
	ctx.strokeStyle = '#9ca3af'
	ctx.lineWidth = 1
	ctx.stroke()

	// Draw pendulum position
	const x = center + props.position.x * scale
	const y = center + props.position.y * scale

	// Line from center to position
	ctx.beginPath()
	ctx.moveTo(center, center)
	ctx.lineTo(x, y)
	ctx.strokeStyle = '#3b82f6'
	ctx.lineWidth = 2
	ctx.stroke()

	// Position dot with depth cues
	// Size based on Y (height): lower Y = higher up = closer to camera = bigger
	// Y ranges from ~0 (at suspension, high) to ropeLength (fully extended down, low)
	const yNormalized = Math.max(0, Math.min(1, props.position3D.y / props.ropeLength))
	const sizeScale = 2.6 - yNormalized * 1.4 // 2.6 (high/close) to 1.8 (low/far)
	const dotRadius = 6 * sizeScale

	// Darkness: higher Y = closer to ground = darker
	const lightness = 80 - yNormalized * 40 // 80% (light, top) to 50% (dark, bottom)

	ctx.beginPath()
	ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
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

watch(() => [props.position, props.position3D, props.ropeLength], draw, { deep: true })
watch(canvasSize, draw)
</script>
