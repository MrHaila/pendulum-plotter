<template>
	<div>
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
import type { Vec3 } from '@/types'

const props = defineProps<{
	position3D: Vec3
	velocity: Vec3
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
	ctx.strokeStyle = '#8d7a65'
	ctx.lineWidth = 1
	ctx.stroke()

	// Draw ground line
	const groundY = topY + props.ropeLength * scale
	ctx.beginPath()
	ctx.moveTo(0, groundY)
	ctx.lineTo(size, groundY)
	ctx.strokeStyle = '#8d7a65'
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
	ctx.strokeStyle = '#6b7280'
	ctx.lineWidth = 2
	ctx.stroke()

	// Draw velocity arrow
	// Velocity in XY plane
	const vx = props.velocity.x
	const vy = props.velocity.y
	const speed = Math.sqrt(vx * vx + vy * vy)

	if (speed > 0.01) {
		const arrowScale = scale * 0.3 // Scale factor for visual length
		const endX = x + vx * arrowScale
		const endY = y + vy * arrowScale

		ctx.beginPath()
		ctx.moveTo(x, y)
		ctx.lineTo(endX, endY)
		ctx.strokeStyle = '#ef4444' // Red arrow
		ctx.lineWidth = 2
		ctx.stroke()

		// Arrowhead with perspective scaling
		// Z velocity is depth (in/out of screen)
		// Positive Z is towards camera, Negative Z is away
		const depthVel = props.velocity.z
		const perspectiveScale = Math.max(0.2, Math.min(2.5, 1 + (depthVel / 5) * 1.0))
		const headLen = 10 * perspectiveScale

		const angle = Math.atan2(vy, vx)
		ctx.beginPath()
		ctx.moveTo(endX, endY)
		ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6))
		ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6))
		ctx.lineTo(endX, endY)
		ctx.fillStyle = '#ef4444'
		ctx.fill()
	}

	// Draw bucket with depth cues
	// Size based on Z (depth): closer to camera (higher Z) = bigger
	const zNormalized = Math.max(-1, Math.min(1, props.position3D.z / props.ropeLength))
	const sizeScale = 1.8 + zNormalized * 0.8 // 1.8 to 2.6 scale
	const bucketRadius = 6 * sizeScale

	// Brightness based on Z (depth) to match size cue: higher Z (closer) = brighter (subtle)
	const lightness = 50 + zNormalized * 15 // 58% (far) to 72% (close)

	ctx.beginPath()
	ctx.arc(x, y, bucketRadius, 0, Math.PI * 2)
	ctx.fillStyle = `hsl(28, 90%, ${lightness}%)`
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

watch(() => [props.position3D, props.velocity, props.ropeLength], draw, { deep: true })
watch(canvasSize, draw)
</script>
