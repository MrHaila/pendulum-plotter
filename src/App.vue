<template>
	<!-- Show narrow screen message when window is too small -->
	<NarrowScreenMessage v-if="isTooNarrow" :current-width="windowWidth" :min-width="minWidth" />

	<!-- Main application layout -->
	<div v-else class="flex h-full bg-base-50 dark:bg-base-900">
		<!-- Left Sidebar -->
		<aside
			class="w-80 border-r border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] bg-base-100 dark:bg-base-800 p-3 space-y-0 flex flex-col"
		>
			<div class="flex-1 overflow-y-auto pr-1 space-y-6">
				<!-- Parameters Section (always visible) -->
				<section class="space-y-3">
					<SidebarSectionHeader label="Reality Configuration" />
					<InitialParameterControls
						:config="initialConfig"
						:disabled="status === 'running'"
						@update="handleInitialConfigUpdate"
					/>
				</section>

				<!-- Simulation Controls Section -->
				<section class="space-y-3">
					<SidebarSectionHeader label="Simulation Controls" />
					<ControlPanel
						:mode="mode"
						:status="status"
						@reset="handleReset"
						@generate="handleGenerate"
						@start="handleStart"
						@pause="handlePause"
						@resume="handleResume"
						@mode-change="handleModeChange"
					/>
				</section>

				<!-- Export Section -->
				<section class="space-y-3">
					<SidebarSectionHeader label="Export" />
					<ExportPanel
						:point-count="pointCount"
						:trim-start="trimStart"
						:trim-end="trimEnd"
						:disabled="status === 'running' || status === 'idle'"
						@update:trim-start="handleTrimStartUpdate"
						@update:trim-end="handleTrimEndUpdate"
						@export="handleExport"
					/>
				</section>
			</div>
			<div class="pt-4">
				<DarkModeToggle />
			</div>
		</aside>

		<!-- Main Canvas Area -->
		<main class="flex-1 flex items-center justify-center p-8 bg-base-50 dark:bg-base-900 relative">
			<RawDataDisplay :points="trimmedCanvasPoints" />
			<PaintCanvas :points="trimmedCanvasPoints" />
		</main>

		<!-- Right Diagnostics -->
		<aside
			class="w-80 border-l border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] bg-base-100 dark:bg-base-800 overflow-y-auto p-3 space-y-6"
		>
			<!-- Runtime Stats Section -->
			<section class="space-y-3">
				<SidebarSectionHeader label="Spatio-Temporal Observations" />
				<RuntimeStats :state="state" :point-count="pointCount" />
			</section>

			<!-- Top-Down View Section -->
			<section class="space-y-3">
				<SidebarSectionHeader label="XZ Planar Projection" />
				<TopDownView
					:position="currentGroundPosition"
					:position3-d="current3DPosition"
					:rope-length="currentRopeLength"
				/>
			</section>

			<!-- Side View Section -->
			<section class="space-y-3">
				<SidebarSectionHeader label="XY Planar Projection" />
				<SideView :position3-d="current3DPosition" :rope-length="currentRopeLength" />
			</section>
		</aside>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSimulation } from '@/composables/useSimulation'
import { useBreakpoint } from '@/composables/useBreakpoint'
import type { SimulationMode } from '@/composables/useSimulation'
import { sphericalToCartesian } from '@/core/physics'
import { downloadSVG } from '@/utils/svg'
import ControlPanel from '@/components/controls/ControlPanel.vue'
import InitialParameterControls from '@/components/controls/InitialParameterControls.vue'
import ExportPanel from '@/components/controls/ExportPanel.vue'
import DarkModeToggle from '@/components/controls/DarkModeToggle.vue'
import SidebarSectionHeader from '@/components/controls/SidebarSectionHeader.vue'
import PaintCanvas from '@/components/canvas/PaintCanvas.vue'
import TopDownView from '@/components/debug/TopDownView.vue'
import SideView from '@/components/debug/SideView.vue'
import RawDataDisplay from '@/components/debug/RawDataDisplay.vue'
import RuntimeStats from '@/components/debug/RuntimeStats.vue'
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
	updateInitialConfig,
	setMode,
} = useSimulation(defaultConfig)

// Point count for stats
const pointCount = computed(() => paintPoints.value.length)

// Trim controls for export
const trimStart = ref(0)
const trimEnd = ref(0)

// Reset trim to full range when pointCount changes (new simulation)
watch(pointCount, newCount => {
	trimStart.value = 0
	trimEnd.value = newCount
})

// Trimmed canvas points for display and export
const trimmedCanvasPoints = computed(() => {
	return canvasPoints.value.slice(trimStart.value, trimEnd.value)
})

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
	reset()
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

const handleModeChange = (newMode: SimulationMode) => {
	// If switching from realtime to instant while running, reset the simulation
	if (mode.value === 'realtime' && newMode === 'instant' && status.value === 'running') {
		reset()
	}
	setMode(newMode)
}

const handleInitialConfigUpdate = (newConfig: Partial<SimulationConfig>) => {
	updateInitialConfig(newConfig)
}

const handleTrimStartUpdate = (value: number) => {
	trimStart.value = value
}

const handleTrimEndUpdate = (value: number) => {
	trimEnd.value = value
}

const handleExport = () => {
	downloadSVG(trimmedCanvasPoints.value)
}
</script>
