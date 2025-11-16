<template>
	<!-- Show narrow screen message when window is too small -->
	<NarrowScreenMessage v-if="isTooNarrow" :current-width="windowWidth" :min-width="minWidth" />

	<!-- Main application layout -->
	<div v-else class="flex h-full">
		<!-- Left Sidebar -->
		<aside class="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto p-4 space-y-4">
			<ControlPanel
				:mode="mode"
				:status="status"
				@reset="handleReset"
				@generate="handleGenerate"
				@start="handleStart"
				@pause="handlePause"
				@resume="handleResume"
				@stop="handleStop"
				@mode-change="handleModeChange"
				@export="handleExport"
			/>

			<!-- Show initial controls when idle/completed, runtime controls when running/paused -->
			<InitialParameterControls
				v-if="status === 'idle' || status === 'completed'"
				:config="initialConfig"
				@update="handleInitialConfigUpdate"
			/>
			<RuntimeParameterControls v-else :state="state" :point-count="paintPoints.length" />
		</aside>

		<!-- Main Canvas Area -->
		<main class="flex-1 flex items-center justify-center p-8 bg-white relative">
			<RawDataDisplay :points="canvasPoints" />
			<PaintCanvas :points="canvasPoints" />
		</main>

		<!-- Right Diagnostics -->
		<aside class="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto p-4 space-y-4">
			<TopDownView :position="currentGroundPosition" :rope-length="currentRopeLength" />
			<SideView :position3-d="current3DPosition" :rope-length="currentRopeLength" />
		</aside>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSimulation } from '@/composables/useSimulation'
import { useBreakpoint } from '@/composables/useBreakpoint'
import type { SimulationMode } from '@/composables/useSimulation'
import { sphericalToCartesian } from '@/core/physics'
import { downloadSVG } from '@/utils/svg'
import ControlPanel from '@/components/controls/ControlPanel.vue'
import InitialParameterControls from '@/components/controls/InitialParameterControls.vue'
import RuntimeParameterControls from '@/components/controls/RuntimeParameterControls.vue'
import PaintCanvas from '@/components/canvas/PaintCanvas.vue'
import TopDownView from '@/components/debug/TopDownView.vue'
import SideView from '@/components/debug/SideView.vue'
import RawDataDisplay from '@/components/debug/RawDataDisplay.vue'
import NarrowScreenMessage from '@/components/NarrowScreenMessage.vue'
import type { SimulationConfig, Point2D, Vec3 } from '@/types'

// Responsive breakpoint detection
const { windowWidth, isTooNarrow, minWidth } = useBreakpoint()

// Default configuration
const defaultConfig: SimulationConfig = {
	ropeLength: 1.0,
	gravity: 9.81,
	damping: 0.05,
	timestep: 0.01,
	initialTheta: 0.5,
	initialPhi: Math.PI / 4,
	initialThetaDot: 0.3,
	initialPhiDot: 0,
}

const {
	canvasPoints,
	paintPoints,
	state,
	mode,
	status,
	initialConfig,
	reset,
	runInstant,
	startRealtime,
	pause,
	resume,
	stop,
	updateInitialConfig,
	setMode,
} = useSimulation(defaultConfig)

// Current rope length (from initial config)
const currentRopeLength = computed(() => initialConfig.value.ropeLength)

// Current 3D position for diagnostics
const current3DPosition = computed<Vec3>(() => {
	return sphericalToCartesian(state.value.theta, state.value.phi, currentRopeLength.value)
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

const handleStart = () => {
	startRealtime()
}

const handlePause = () => {
	pause()
}

const handleResume = () => {
	resume()
}

const handleStop = () => {
	stop()
}

const handleModeChange = (newMode: SimulationMode) => {
	// If switching from realtime to instant while running, stop the animation
	if (mode.value === 'realtime' && newMode === 'instant' && status.value === 'running') {
		stop()
	}
	setMode(newMode)
}

const handleInitialConfigUpdate = (newConfig: Partial<SimulationConfig>) => {
	updateInitialConfig(newConfig)
}

const handleExport = () => {
	downloadSVG(canvasPoints.value)
}
</script>
