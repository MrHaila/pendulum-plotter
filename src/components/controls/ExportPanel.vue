<template>
	<div class="space-y-3">
		<!-- Trim Controls -->
		<div>
			<label class="block text-xs font-medium text-gray-600 mb-2">
				{{ displayLabel }}
			</label>

			<!-- Start Trim -->
			<div class="mb-2">
				<label class="block text-xs font-medium text-gray-500 mb-1">Start</label>
				<input
					:value="props.trimStart"
					type="number"
					:min="0"
					:max="Math.max(0, pointCount - 1)"
					:disabled="disabled || pointCount === 0"
					class="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
					@input="updateStart"
				/>
			</div>

			<!-- End Trim -->
			<div>
				<label class="block text-xs font-medium text-gray-500 mb-1">End</label>
				<input
					:value="props.trimEnd"
					type="number"
					:min="0"
					:max="Math.max(0, pointCount)"
					:disabled="disabled || pointCount === 0"
					class="w-full px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
					@input="updateEnd"
				/>
			</div>
		</div>

		<!-- Reset Trim Button -->
		<button
			:disabled="disabled || (props.trimStart === 0 && props.trimEnd === pointCount)"
			class="w-full px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			@click="resetTrim"
		>
			Reset Trim
		</button>

		<!-- Export Button -->
		<button
			:disabled="disabled"
			class="w-full px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
			@click="$emit('export')"
		>
			Export SVG
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
