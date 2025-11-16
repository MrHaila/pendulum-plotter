<template>
	<div class="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
		<h3 class="text-sm font-semibold mb-3 text-gray-700">Parameters</h3>

		<div class="space-y-4">
			<!-- Rope Length -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-1">
					Rope Length: {{ localConfig.ropeLength.toFixed(2) }}m
				</label>
				<input
					v-model.number="localConfig.ropeLength"
					type="range"
					min="0.5"
					max="2"
					step="0.1"
					class="w-full"
					@change="emitUpdate"
				/>
			</div>

			<!-- Gravity -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-1">
					Gravity: {{ localConfig.gravity.toFixed(2) }}m/s²
				</label>
				<input
					v-model.number="localConfig.gravity"
					type="range"
					min="1"
					max="20"
					step="0.5"
					class="w-full"
					@change="emitUpdate"
				/>
			</div>

			<!-- Damping -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-1">
					Damping: {{ localConfig.damping.toFixed(3) }}
				</label>
				<input
					v-model.number="localConfig.damping"
					type="range"
					min="0"
					max="0.1"
					step="0.001"
					class="w-full"
					@change="emitUpdate"
				/>
			</div>

			<!-- Initial Theta -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-1">
					Initial θ: {{ localConfig.initialTheta.toFixed(2) }} rad
				</label>
				<input
					v-model.number="localConfig.initialTheta"
					type="range"
					min="-3.14"
					max="3.14"
					step="0.1"
					class="w-full"
					@change="emitUpdate"
				/>
			</div>

			<!-- Initial Phi -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-1">
					Initial φ: {{ localConfig.initialPhi.toFixed(2) }} rad
				</label>
				<input
					v-model.number="localConfig.initialPhi"
					type="range"
					min="0"
					max="1.57"
					step="0.1"
					class="w-full"
					@change="emitUpdate"
				/>
			</div>

			<!-- Initial Theta Dot -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-1">
					Initial θ̇: {{ localConfig.initialThetaDot.toFixed(2) }} rad/s
				</label>
				<input
					v-model.number="localConfig.initialThetaDot"
					type="range"
					min="-5"
					max="5"
					step="0.1"
					class="w-full"
					@change="emitUpdate"
				/>
			</div>

			<!-- Initial Phi Dot -->
			<div>
				<label class="block text-xs font-medium text-gray-600 mb-1">
					Initial φ̇: {{ localConfig.initialPhiDot.toFixed(2) }} rad/s
				</label>
				<input
					v-model.number="localConfig.initialPhiDot"
					type="range"
					min="-5"
					max="5"
					step="0.1"
					class="w-full"
					@change="emitUpdate"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { SimulationConfig } from '@/types'

const props = defineProps<{
	config: SimulationConfig
}>()

const emit = defineEmits<{
	update: [config: Partial<SimulationConfig>]
}>()

const localConfig = reactive({
	ropeLength: props.config.ropeLength,
	gravity: props.config.gravity,
	damping: props.config.damping,
	initialTheta: props.config.initialTheta,
	initialPhi: props.config.initialPhi,
	initialThetaDot: props.config.initialThetaDot,
	initialPhiDot: props.config.initialPhiDot,
})

const emitUpdate = () => {
	emit('update', { ...localConfig })
}
</script>
