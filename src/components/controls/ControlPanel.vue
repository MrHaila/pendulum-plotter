<template>
	<div class="p-6 space-y-6">
		<div>
			<h2 class="text-xl font-semibold mb-4">Controls</h2>

			<div class="space-y-4">
				<!-- Reset Button -->
				<button
					class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
					@click="$emit('reset')"
				>
					Reset
				</button>

				<!-- Generate Section -->
				<div class="space-y-2">
					<label class="block text-sm font-medium text-gray-700">Steps</label>
					<input
						v-model.number="steps"
						type="number"
						min="100"
						max="10000"
						step="100"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
					<button
						class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						@click="handleGenerate"
					>
						Generate
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
	reset: []
	generate: [steps: number]
}>()

const steps = ref(1000)

const handleGenerate = () => {
	emit('generate', steps.value)
}
</script>
