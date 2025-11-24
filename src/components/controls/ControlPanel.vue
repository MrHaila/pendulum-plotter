<template>
	<div class="space-y-3">
		<!-- Mode Tabs -->
		<div class="bg-base-200 dark:bg-base-700 rounded-lg p-1 flex gap-1">
			<button
				type="button"
				:class="[
					'flex-1 px-3 py-2 text-[11px] font-display tracking-[0.2em] uppercase rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary-400',
					mode === 'realtime'
						? 'bg-base-0 text-base-900 shadow-sm dark:bg-linear-to-b from-accent-primary-300 to-accent-primary-500 dark:text-base-0 bg-accent-primary-300'
						: 'text-base-500 dark:text-base-400 hover:bg-base-0/70 hover:text-base-900 hover:shadow-sm dark:hover:bg-base-600 dark:hover:text-base-100',
					status === 'running' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
				]"
				:aria-pressed="mode === 'realtime'"
				:disabled="status === 'running'"
				@click="$emit('mode-change', 'realtime')"
			>
				Real-time
			</button>
			<button
				type="button"
				:class="[
					'flex-1 px-3 py-2 text-[11px] font-display tracking-[0.2em] uppercase rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary-400',
					mode === 'instant'
						? 'bg-base-0 text-base-900 shadow-sm dark:bg-linear-to-b from-accent-primary-300 to-accent-primary-500 dark:text-base-0 bg-accent-primary-300'
						: 'text-base-500 dark:text-base-400 hover:bg-base-0/70 hover:text-base-900 hover:shadow-sm dark:hover:bg-base-600 dark:hover:text-base-100',
					status === 'running' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
				]"
				:aria-pressed="mode === 'instant'"
				:disabled="status === 'running'"
				@click="$emit('mode-change', 'instant')"
			>
				Instant
			</button>
		</div>

		<!-- Instant Mode Controls -->
		<div v-if="mode === 'instant'">
			<label class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400"
				>Iteration Count</label
			>
			<input
				v-model.number="steps"
				type="number"
				min="100"
				max="20000"
				step="100"
				:disabled="status === 'running'"
				class="w-full px-2 py-2 mb-2 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:cursor-not-allowed transition-all duration-120"
			/>
			<AppButton
				v-show="!hasContent"
				class="w-full px-4 py-2"
				variant="primary"
				:disabled="status === 'running'"
				@click="handleGenerate"
			>
				Run
			</AppButton>
			<!-- Clear Button for Instant Mode -->
			<AppButton
				v-show="hasContent"
				class="w-full px-4 py-2"
				variant="secondary"
				:disabled="status === 'running'"
				@click="$emit('reset')"
			>
				Clear Experiment
			</AppButton>
		</div>

		<!-- Real-time Mode Controls -->
		<div v-else class="space-y-2">
			<!-- Start/Resume Button -->
			<AppButton
				v-show="(status === 'idle' || status === 'completed') && !hasContent"
				class="w-full px-4 py-2"
				variant="primary"
				@click="$emit('start')"
			>
				Start
			</AppButton>

			<AppButton v-show="status === 'paused'" class="w-full px-4 py-2" variant="primary" @click="$emit('resume')">
				Resume
			</AppButton>

			<!-- Pause Button -->
			<AppButton v-show="status === 'running'" class="w-full px-4 py-2" variant="primary" @click="$emit('pause')">
				Stop
			</AppButton>

			<!-- Clear Button for Real-time Mode -->
			<AppButton
				class="w-full px-4 py-2"
				variant="secondary"
				:disabled="status === 'running' || status === 'idle'"
				@click="$emit('reset')"
			>
				Clear Experiment
			</AppButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/common/AppButton.vue'
import type { SimulationMode, SimulationStatus } from '@/composables/useSimulation'

defineProps<{
	mode: SimulationMode
	status: SimulationStatus
	hasContent: boolean
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
