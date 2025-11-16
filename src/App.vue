<template>
	<div class="flex h-full">
		<!-- Left Sidebar -->
		<aside class="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
			<ControlPanel @reset="handleReset" @generate="handleGenerate" />
		</aside>

		<!-- Main Canvas Area -->
		<main class="flex-1 flex items-center justify-center p-8 bg-white">
			<PaintCanvas :points="canvasPoints" />
		</main>
	</div>
</template>

<script setup lang="ts">
import { useSimulation } from '@/composables/useSimulation'
import ControlPanel from '@/components/controls/ControlPanel.vue'
import PaintCanvas from '@/components/canvas/PaintCanvas.vue'

// Default configuration
const defaultConfig = {
	ropeLength: 1.0,
	gravity: 9.81,
	damping: 0.01,
	timestep: 0.01,
	initialTheta: 0.5,
	initialPhi: Math.PI / 4,
	initialThetaDot: 0,
	initialPhiDot: 0,
}

const { canvasPoints, reset, runInstant } = useSimulation(defaultConfig)

const handleReset = () => {
	reset()
}

const handleGenerate = (steps: number) => {
	runInstant(steps)
}
</script>
