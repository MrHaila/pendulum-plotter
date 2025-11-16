<template>
	<div class="space-y-3">
		<h3 class="text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400">
			Execution Mode
		</h3>

		<!-- Mode Toggle -->
		<div class="flex gap-2">
			<button
				:class="[
					'flex-1 px-3 py-2 text-xs font-display font-light tracking-wider uppercase rounded-md transition-all duration-150',
					mode === 'instant'
						? 'bg-gradient-to-b from-accent-primary-500 to-accent-primary-700 text-white shadow-[0_1px_3px_rgba(69,40,20,0.08)]'
						: 'bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-100 hover:bg-base-300 dark:hover:bg-base-600',
				]"
				:disabled="status === 'running'"
				@click="$emit('mode-change', 'instant')"
			>
				Instant
			</button>
			<button
				:class="[
					'flex-1 px-3 py-2 text-xs font-display font-light tracking-wider uppercase rounded-md transition-all duration-150',
					mode === 'realtime'
						? 'bg-gradient-to-b from-accent-primary-500 to-accent-primary-700 text-white shadow-[0_1px_3px_rgba(69,40,20,0.08)]'
						: 'bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-100 hover:bg-base-300 dark:hover:bg-base-600',
				]"
				:disabled="status === 'running'"
				@click="$emit('mode-change', 'realtime')"
			>
				Real-time
			</button>
		</div>

		<!-- Instant Mode Controls -->
		<div v-if="mode === 'instant'" class="space-y-2">
			<label class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400"
				>Iteration Count</label
			>
			<input
				v-model.number="steps"
				type="number"
				min="100"
				max="20000"
				step="100"
				:disabled="status !== 'idle' && status !== 'completed'"
				class="w-full px-2 py-2 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:cursor-not-allowed transition-all duration-120"
			/>
			<button
				class="w-full px-4 py-2 text-xs font-display font-light tracking-wider uppercase bg-gradient-to-b from-accent-primary-500 to-accent-primary-700 text-white rounded-md shadow-[0_1px_3px_rgba(69,40,20,0.08)] hover:shadow-[0_4px_8px_rgba(69,40,20,0.1)] transition-all duration-120 disabled:from-base-300 disabled:to-base-300 dark:disabled:from-base-700 dark:disabled:to-base-700 disabled:text-base-500 disabled:cursor-not-allowed"
				:disabled="status === 'running'"
				@click="handleGenerate"
			>
				Execute: Instant
			</button>
		</div>

		<!-- Real-time Mode Controls -->
		<div v-else class="space-y-2">
			<!-- Start/Resume Button -->
			<button
				v-if="status === 'idle' || status === 'completed'"
				class="w-full px-4 py-2 text-xs font-display font-light tracking-wider uppercase bg-gradient-to-b from-accent-primary-500 to-accent-primary-700 text-white rounded-md shadow-[0_1px_3px_rgba(69,40,20,0.08)] hover:shadow-[0_4px_8px_rgba(69,40,20,0.1)] transition-all duration-120"
				@click="$emit('start')"
			>
				Execute: Real-Time
			</button>

			<button
				v-else-if="status === 'paused'"
				class="w-full px-4 py-2 text-xs font-display font-light tracking-wider uppercase bg-gradient-to-b from-accent-primary-500 to-accent-primary-700 text-white rounded-md shadow-[0_1px_3px_rgba(69,40,20,0.08)] hover:shadow-[0_4px_8px_rgba(69,40,20,0.1)] transition-all duration-120"
				@click="$emit('resume')"
			>
				Resume
			</button>

			<!-- Pause Button -->
			<button
				v-if="status === 'running'"
				class="w-full px-4 py-2 text-xs font-display font-light tracking-wider uppercase bg-gradient-to-b from-accent-secondary-500 to-accent-secondary-700 dark:from-accent-secondary-300 dark:to-accent-secondary-500 text-white rounded-md shadow-[0_1px_3px_rgba(69,40,20,0.08)] hover:shadow-[0_4px_8px_rgba(69,40,20,0.1)] transition-all duration-120"
				@click="$emit('pause')"
			>
				Pause
			</button>

			<!-- Reset Button (always visible) -->
			<button
				class="w-full px-4 py-2 text-xs font-display font-light tracking-wider uppercase bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-100 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md hover:bg-base-300 dark:hover:bg-base-600 transition-all duration-120 disabled:opacity-50 disabled:cursor-not-allowed"
				:disabled="status === 'running'"
				@click="$emit('reset')"
			>
				State Reinitialization
			</button>
		</div>
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
	'mode-change': [mode: SimulationMode]
}>()

const steps = ref(5000)

const handleGenerate = () => {
	emit('generate', steps.value)
}
</script>
