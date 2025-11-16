<template>
	<div class="flex h-full">
		<!-- Left Sidebar -->
		<aside class="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto p-4 space-y-4">
			<ControlPanel @reset="handleReset" @generate="handleGenerate" />
			<ParameterControls :config="config" @update="handleConfigUpdate" />
			<StateDisplay :state="state" :point-count="paintPoints.length" />
		</aside>

		<!-- Main Canvas Area -->
		<main class="flex-1 flex items-center justify-center p-8 bg-white relative">
			<RawDataDisplay :points="canvasPoints" />
			<PaintCanvas :points="canvasPoints" />
		</main>

		<!-- Right Diagnostics -->
		<aside class="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto p-4 space-y-4">
			<TopDownView :position="currentGroundPosition" :rope-length="config.ropeLength" />
			<SideView :position3-d="current3DPosition" :rope-length="config.ropeLength" />
		</aside>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSimulation } from '@/composables/useSimulation'
import { sphericalToCartesian } from '@/core/physics'
import ControlPanel from '@/components/controls/ControlPanel.vue'
import ParameterControls from '@/components/controls/ParameterControls.vue'
import PaintCanvas from '@/components/canvas/PaintCanvas.vue'
import StateDisplay from '@/components/debug/StateDisplay.vue'
import TopDownView from '@/components/debug/TopDownView.vue'
import SideView from '@/components/debug/SideView.vue'
import RawDataDisplay from '@/components/debug/RawDataDisplay.vue'
import type { SimulationConfig, Point2D, Vec3 } from '@/types'

// Default configuration
const config = ref<SimulationConfig>({
	ropeLength: 1.0,
	gravity: 9.81,
	damping: 0.01,
	timestep: 0.01,
	initialTheta: 0.5,
	initialPhi: Math.PI / 4,
	initialThetaDot: 0,
	initialPhiDot: 0,
})

const { canvasPoints, paintPoints, state, reset, runInstant, updateConfig } = useSimulation(config.value)

// Current 3D position for diagnostics
const current3DPosition = computed<Vec3>(() => {
	return sphericalToCartesian(state.value.theta, state.value.phi, config.value.ropeLength)
})

// Current ground position (XZ) for top-down view
const currentGroundPosition = computed<Point2D>(() => {
	const pos = current3DPosition.value
	return { x: pos.x, y: pos.z }
})

const handleReset = () => {
	reset()
}

const handleGenerate = (steps: number) => {
	runInstant(steps)
}

const handleConfigUpdate = (newConfig: Partial<SimulationConfig>) => {
	config.value = { ...config.value, ...newConfig }
	updateConfig(newConfig)
}
</script>
