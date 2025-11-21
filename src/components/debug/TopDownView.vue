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
import type { Point2D, Vec3 } from '@/types'

const props = defineProps<{
	position: Point2D
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
	const center = size / 2
	const scale = (size * 0.8) / (2 * props.ropeLength)

	// Clear
	ctx.clearRect(0, 0, size, size)

	// Draw boundary circle with dashed styling to match SideView floor
	ctx.beginPath()
	ctx.arc(center, center, props.ropeLength * scale, 0, Math.PI * 2)
	ctx.strokeStyle = '#8d7a65'
	ctx.lineWidth = 2
	ctx.setLineDash([5, 5])
	ctx.stroke()
	ctx.setLineDash([])

	// Draw center cross
	ctx.beginPath()
	ctx.moveTo(center - 10, center)
	ctx.lineTo(center + 10, center)
	ctx.moveTo(center, center - 10)
	ctx.lineTo(center, center + 10)
	ctx.strokeStyle = '#8d7a65'
	ctx.lineWidth = 1
	ctx.stroke()

	// Draw pendulum position
	const x = center + props.position.x * scale
	const y = center + props.position.y * scale

	// Line from center to position
	ctx.beginPath()
	ctx.moveTo(center, center)
	ctx.lineTo(x, y)
	ctx.strokeStyle = '#6b7280'
	ctx.lineWidth = 2
	ctx.stroke()

	// Draw velocity arrow
	// Velocity in XZ plane
	const vx = props.velocity.x
	const vy = props.velocity.z // Y on screen is Z in 3D for top-down
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
		// Y velocity is depth (vertical movement)
		// Positive Y is down (away from camera), Negative Y is up (towards camera)
		const depthVel = -props.velocity.y
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

watch(() => [props.position, props.position3D, props.velocity, props.ropeLength], draw, { deep: true })
watch(canvasSize, draw)
</script>
