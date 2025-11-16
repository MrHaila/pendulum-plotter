<template>
	<div>
		<h3 class="text-sm font-semibold mb-3 text-gray-700">Top-Down View (XZ)</h3>
		<canvas
			ref="canvasRef"
			:width="size"
			:height="size"
			class="border border-gray-300 bg-gray-50"
			:style="{ width: size / 2 + 'px', height: size / 2 + 'px' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Point2D } from '@/types'

const props = defineProps<{
	position: Point2D
	ropeLength: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const size = 400

const draw = () => {
	const canvas = canvasRef.value
	if (!canvas) return

	const ctx = canvas.getContext('2d')
	if (!ctx) return

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

	// Position dot
	ctx.beginPath()
	ctx.arc(x, y, 6, 0, Math.PI * 2)
	ctx.fillStyle = '#ef4444'
	ctx.fill()
}

watch(() => [props.position, props.ropeLength], draw, { deep: true })
onMounted(draw)
</script>
