<template>
	<div>
		<h3 class="text-sm font-semibold mb-3 text-gray-700">Side View (XY)</h3>
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
import type { Vec3 } from '@/types'

const props = defineProps<{
	position3D: Vec3
	ropeLength: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const size = 400

const draw = () => {
	const canvas = canvasRef.value
	if (!canvas) return

	const ctx = canvas.getContext('2d')
	if (!ctx) return

	const centerX = size / 2
	const topY = 40
	const scale = (size * 0.8) / props.ropeLength

	// Clear
	ctx.clearRect(0, 0, size, size)

	// Draw suspension point
	ctx.beginPath()
	ctx.arc(centerX, topY, 8, 0, Math.PI * 2)
	ctx.fillStyle = '#6b7280'
	ctx.fill()

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

	// Draw bucket
	ctx.beginPath()
	ctx.arc(x, y, 6, 0, Math.PI * 2)
	ctx.fillStyle = '#ef4444'
	ctx.fill()
}

watch(() => [props.position3D, props.ropeLength], draw, { deep: true })
onMounted(draw)
</script>
