<template>
	<!-- Show narrow screen message when window is too small -->
	<NarrowScreenMessage v-if="isTooNarrow" :current-width="windowWidth" :min-width="minWidth" />

	<!-- Main application layout -->
	<div v-else class="flex h-full">
		<!-- Left Sidebar -->
		<aside class="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto p-4 space-y-0">
			<!-- Parameters Section (always visible) -->
			<div class="pb-4">
				<InitialParameterControls :config="initialConfig" @update="handleInitialConfigUpdate" />
			</div>

			<div class="border-t border-gray-300" />

			<!-- Simulation Controls Section -->
			<div class="py-4">
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
			</div>

			<div class="border-t border-gray-300" />

			<!-- Export Section -->
			<div class="py-4">
				<ExportControls :disabled="status === 'running' || status === 'idle'" @export="handleExport" />
			</div>
		</aside>

		<!-- Main Canvas Area -->
		<main class="flex-1 flex items-center justify-center p-8 bg-white relative">
			<RawDataDisplay :points="canvasPoints" />
			<PaintCanvas :points="canvasPoints" />
		</main>

		<!-- Right Diagnostics -->
		<aside class="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto p-4 space-y-0">
			<!-- Runtime Stats Section -->
			<div class="pb-4">
				<h3 class="text-sm font-semibold mb-3 text-gray-700">Runtime Stats</h3>
				<div class="space-y-3">
					<!-- Time -->
					<div>
						<label class="block text-xs font-medium text-gray-700 mb-1">Elapsed Time</label>
						<div class="text-lg font-mono font-semibold text-gray-800">{{ state.time.toFixed(2) }}s</div>
					</div>

					<!-- Point Count -->
					<div>
						<label class="block text-xs font-medium text-gray-700 mb-1">Points Generated</label>
						<div class="text-sm font-mono text-gray-700">
							{{ state.time === 0 ? '0' : pointCount.toLocaleString() }}
						</div>
					</div>

					<!-- Current State -->
					<div class="pt-2 border-t border-gray-300">
						<label class="block text-xs font-medium text-gray-700 mb-2">Current State</label>
						<div class="space-y-2">
							<!-- Theta -->
							<div>
								<div class="text-xs font-mono text-gray-600 mb-1">θ: {{ state.theta.toFixed(3) }} rad</div>
								<div class="h-1.5 bg-blue-200 rounded-full overflow-hidden">
									<div
										class="h-full bg-blue-500 transition-all duration-100"
										:style="{ width: `${((state.theta + Math.PI) / (2 * Math.PI)) * 100}%` }"
									/>
								</div>
							</div>

							<!-- Phi -->
							<div>
								<div class="text-xs font-mono text-gray-600 mb-1">φ: {{ state.phi.toFixed(3) }} rad</div>
								<div class="h-1.5 bg-purple-200 rounded-full overflow-hidden">
									<div
										class="h-full bg-purple-500 transition-all duration-100"
										:style="{ width: `${(state.phi / Math.PI) * 100}%` }"
									/>
								</div>
							</div>

							<!-- Theta Dot -->
							<div>
								<div class="text-xs font-mono text-gray-600 mb-1">θ̇: {{ state.thetaDot.toFixed(3) }} rad/s</div>
								<div class="h-1.5 bg-green-200 rounded-full overflow-hidden">
									<div
										class="h-full bg-green-500 transition-all duration-100"
										:style="{ width: `${Math.min((Math.abs(state.thetaDot) / 10) * 100, 100)}%` }"
									/>
								</div>
							</div>

							<!-- Phi Dot -->
							<div>
								<div class="text-xs font-mono text-gray-600 mb-1">φ̇: {{ state.phiDot.toFixed(3) }} rad/s</div>
								<div class="h-1.5 bg-yellow-200 rounded-full overflow-hidden">
									<div
										class="h-full bg-yellow-500 transition-all duration-100"
										:style="{ width: `${Math.min((Math.abs(state.phiDot) / 10) * 100, 100)}%` }"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="border-t border-gray-300" />

			<!-- Top-Down View Section -->
			<div class="py-4">
				<TopDownView :position="currentGroundPosition" :rope-length="currentRopeLength" />
			</div>

			<div class="border-t border-gray-300" />

			<!-- Side View Section -->
			<div class="py-4">
				<SideView :position3-d="current3DPosition" :rope-length="currentRopeLength" />
			</div>
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
import ExportControls from '@/components/controls/ExportControls.vue'
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
	updateInitialConfig,
	setMode,
} = useSimulation(defaultConfig)

// Point count for stats
const pointCount = computed(() => paintPoints.value.length)

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

const handleExport = () => {
	downloadSVG(canvasPoints.value)
}
</script>
