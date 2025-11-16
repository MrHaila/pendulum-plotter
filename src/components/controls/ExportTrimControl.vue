<template>
	<div class="space-y-3">
		<div>
			<label class="block text-xs font-medium text-gray-600 mb-2">
				Trim Range: {{ props.trimStart }} - {{ props.trimEnd }} (of {{ pointCount }})
			</label>

			<!-- Start Trim -->
			<div class="mb-2">
				<label class="block text-xs font-medium text-gray-500 mb-1">Start</label>
				<input
					:value="props.trimStart"
					type="range"
					:min="0"
					:max="Math.max(0, pointCount - 1)"
					:disabled="pointCount === 0"
					class="w-full disabled:opacity-50 disabled:cursor-not-allowed"
					@input="updateStart"
				/>
			</div>

			<!-- End Trim -->
			<div>
				<label class="block text-xs font-medium text-gray-500 mb-1">End</label>
				<input
					:value="props.trimEnd"
					type="range"
					:min="0"
					:max="Math.max(0, pointCount)"
					:disabled="pointCount === 0"
					class="w-full disabled:opacity-50 disabled:cursor-not-allowed"
					@input="updateEnd"
				/>
			</div>
		</div>

		<!-- Reset Trim Button -->
		<button
			:disabled="props.trimStart === 0 && props.trimEnd === pointCount"
			class="w-full px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			@click="resetTrim"
		>
			Reset Trim
		</button>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	pointCount: number
	trimStart: number
	trimEnd: number
}>()

const emit = defineEmits<{
	'update:trimStart': [value: number]
	'update:trimEnd': [value: number]
}>()

const updateStart = (e: Event) => {
	const value = parseInt((e.target as HTMLInputElement).value, 10)
	if (value <= props.trimEnd) {
		emit('update:trimStart', value)
	}
}

const updateEnd = (e: Event) => {
	const value = parseInt((e.target as HTMLInputElement).value, 10)
	if (value >= props.trimStart) {
		emit('update:trimEnd', value)
	}
}

const resetTrim = () => {
	emit('update:trimStart', 0)
	emit('update:trimEnd', props.pointCount)
}
</script>
