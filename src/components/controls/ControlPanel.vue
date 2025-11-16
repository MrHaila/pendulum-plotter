<template>
	<div class="p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
		<h3 class="text-sm font-semibold text-gray-700">Controls</h3>

		<!-- Mode Toggle -->
		<div class="flex gap-2">
			<button
				:class="[
					'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
					mode === 'instant' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
				]"
				:disabled="status === 'running'"
				@click="$emit('mode-change', 'instant')"
			>
				Instant
			</button>
			<button
				:class="[
					'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
					mode === 'realtime' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
				]"
				:disabled="status === 'running'"
				@click="$emit('mode-change', 'realtime')"
			>
				Real-time
			</button>
		</div>

		<!-- Instant Mode Controls -->
		<div v-if="mode === 'instant'" class="space-y-2">
			<label class="block text-xs font-medium text-gray-600">Steps</label>
			<input
				v-model.number="steps"
				type="number"
				min="100"
				max="20000"
				step="100"
				:disabled="status !== 'idle' && status !== 'completed'"
				class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
			/>
			<button
				class="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
				:disabled="status === 'running'"
				@click="handleGenerate"
			>
				Generate
			</button>
		</div>

		<!-- Real-time Mode Controls -->
		<div v-else class="space-y-2">
			<!-- Start/Resume Button -->
			<button
				v-if="status === 'idle' || status === 'completed'"
				class="w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
				@click="$emit('start')"
			>
				Start
			</button>

			<button
				v-else-if="status === 'paused'"
				class="w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
				@click="$emit('resume')"
			>
				Resume
			</button>

			<!-- Pause Button -->
			<button
				v-if="status === 'running'"
				class="w-full px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
				@click="$emit('pause')"
			>
				Pause
			</button>

			<!-- Stop Button -->
			<button
				v-if="status === 'running' || status === 'paused'"
				class="w-full px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
				@click="$emit('stop')"
			>
				Stop
			</button>
		</div>

		<!-- Export SVG Button -->
		<button
			class="w-full px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
			:disabled="status === 'running' || status === 'idle'"
			@click="$emit('export')"
		>
			Export SVG
		</button>

		<!-- Reset Button (always visible) -->
		<button
			class="w-full px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
			:disabled="status === 'running'"
			@click="$emit('reset')"
		>
			Reset
		</button>

		<!-- Status Indicator -->
		<div class="text-xs text-gray-500 text-center font-mono">Status: {{ status }}</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SimulationMode, SimulationStatus } from '@/composables/useSimulation'

defineProps<{
	mode: SimulationMode
	status: SimulationStatus
}>()

const emit = defineEmits<{
	reset: []
	generate: [steps: number]
	start: []
	pause: []
	resume: []
	stop: []
	'mode-change': [mode: SimulationMode]
	export: []
}>()

const steps = ref(5000)

const handleGenerate = () => {
	emit('generate', steps.value)
}
</script>
