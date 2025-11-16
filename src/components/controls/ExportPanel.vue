<template>
	<div class="space-y-3">
		<!-- Trim Controls -->
		<div>
			<label
				class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-2"
			>
				{{ displayLabel }}
			</label>

			<!-- Start Trim -->
			<div class="mb-2">
				<label
					class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-1"
					>Start Point</label
				>
				<input
					:value="props.trimStart"
					type="number"
					:min="0"
					:max="Math.max(0, pointCount - 1)"
					:disabled="disabled || pointCount === 0"
					class="w-full px-2 py-1.5 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-120"
					@input="updateStart"
				/>
			</div>

			<!-- End Trim -->
			<div>
				<label
					class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-1"
					>End Point</label
				>
				<input
					:value="props.trimEnd"
					type="number"
					:min="0"
					:max="Math.max(0, pointCount)"
					:disabled="disabled || pointCount === 0"
					class="w-full px-2 py-1.5 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-120"
					@input="updateEnd"
				/>
			</div>
		</div>

		<!-- Reset Trim Button -->
		<button
			:disabled="disabled || (props.trimStart === 0 && props.trimEnd === pointCount)"
			class="w-full px-3 py-1.5 text-xs font-display font-light tracking-wider uppercase bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-100 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md hover:bg-base-300 dark:hover:bg-base-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-120"
			@click="resetTrim"
		>
			Reset Trim Range
		</button>

		<!-- Export Button -->
		<button
			:disabled="disabled"
			class="w-full px-4 py-2 text-xs font-display font-light tracking-wider uppercase bg-gradient-to-b from-accent-primary-500 to-accent-primary-700 text-white rounded-md shadow-[0_1px_3px_rgba(69,40,20,0.08)] hover:shadow-[0_4px_8px_rgba(69,40,20,0.1)] disabled:from-base-300 disabled:to-base-300 dark:disabled:from-base-700 dark:disabled:to-base-700 disabled:text-base-500 disabled:cursor-not-allowed transition-all duration-120"
			@click="$emit('export')"
		>
			Export SVG Document
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps<{
	pointCount: number
	trimStart: number
	trimEnd: number
	disabled?: boolean
}>()

const emit = defineEmits<{
	export: []
	'update:trimStart': [value: number]
	'update:trimEnd': [value: number]
}>()

// Display label that shows "simulating..." when disabled
const displayLabel = computed(() => {
	if (props.disabled) {
		return 'Trim Range: simulating...'
	}
	return `Trim Range: ${props.trimStart} - ${props.trimEnd} (of ${props.pointCount})`
})

// Watch for disabled -> enabled transition, reset to full range
watch(
	() => props.disabled,
	(newDisabled, oldDisabled) => {
		if (oldDisabled && !newDisabled) {
			// Just became enabled, reset to full range
			emit('update:trimStart', 0)
			emit('update:trimEnd', props.pointCount)
		}
	},
)

const updateStart = (e: Event) => {
	const value = parseInt((e.target as HTMLInputElement).value, 10)
	if (!isNaN(value) && value >= 0 && value <= props.trimEnd) {
		emit('update:trimStart', value)
	}
}

const updateEnd = (e: Event) => {
	const value = parseInt((e.target as HTMLInputElement).value, 10)
	if (!isNaN(value) && value >= props.trimStart && value <= props.pointCount) {
		emit('update:trimEnd', value)
	}
}

const resetTrim = () => {
	emit('update:trimStart', 0)
	emit('update:trimEnd', props.pointCount)
}
</script>
