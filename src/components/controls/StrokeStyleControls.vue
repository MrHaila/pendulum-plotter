<template>
	<div class="space-y-3">
		<!-- Style Type Dropdown -->
		<AppDropdown
			id="stroke-style"
			:model-value="config.type"
			:options="styleOptions"
			label="Style"
			:disabled="disabled"
			@update:model-value="updateType"
		/>

		<!-- Uniform: just base width -->
		<div v-if="config.type === 'uniform'">
			<div class="flex justify-between items-baseline mb-1">
				<label
					for="base-width"
					class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
				>
					Line Width
				</label>
				<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
					>{{ config.baseWidth.toFixed(2) }} pt</span
				>
			</div>
			<input
				id="base-width"
				:value="config.baseWidth"
				type="range"
				min="0.5"
				max="5"
				step="0.25"
				:disabled="disabled"
				:class="sliderClass"
				@input="e => updateConfig({ baseWidth: parseFloat((e.target as HTMLInputElement).value) })"
			/>
		</div>

		<!-- Velocity-Width options -->
		<template v-if="config.type === 'velocity-width'">
			<div>
				<label
					class="block text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400 mb-1"
				>
					Width Range
				</label>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<input
							type="number"
							:value="config.minWidth"
							min="0.1"
							max="10"
							step="0.1"
							:disabled="disabled"
							:class="inputClass"
							@input="e => updateConfig({ minWidth: parseFloat((e.target as HTMLInputElement).value) || 0.5 })"
						/>
						<div class="text-[10px] text-base-500 mt-0.5">Min (fast)</div>
					</div>
					<div>
						<input
							type="number"
							:value="config.maxWidth"
							min="0.1"
							max="10"
							step="0.1"
							:disabled="disabled"
							:class="inputClass"
							@input="e => updateConfig({ maxWidth: parseFloat((e.target as HTMLInputElement).value) || 3 })"
						/>
						<div class="text-[10px] text-base-500 mt-0.5">Max (slow)</div>
					</div>
				</div>
			</div>
			<label class="flex items-center gap-2 text-xs text-base-700 dark:text-base-400 cursor-pointer">
				<input
					type="checkbox"
					:checked="config.invertVelocity"
					:disabled="disabled"
					class="rounded border-base-300 dark:border-base-600 text-accent-primary-500 focus:ring-accent-primary-500 disabled:opacity-50"
					@change="e => updateConfig({ invertVelocity: (e.target as HTMLInputElement).checked })"
				/>
				Invert (fast = thick)
			</label>
		</template>

		<!-- Velocity-Opacity options -->
		<template v-if="config.type === 'velocity-opacity'">
			<div>
				<label
					class="block text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400 mb-1"
				>
					Opacity Range
				</label>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<input
							type="number"
							:value="config.minOpacity"
							min="0"
							max="1"
							step="0.05"
							:disabled="disabled"
							:class="inputClass"
							@input="e => updateConfig({ minOpacity: parseFloat((e.target as HTMLInputElement).value) || 0.1 })"
						/>
						<div class="text-[10px] text-base-500 mt-0.5">Min (fast)</div>
					</div>
					<div>
						<input
							type="number"
							:value="config.maxOpacity"
							min="0"
							max="1"
							step="0.05"
							:disabled="disabled"
							:class="inputClass"
							@input="e => updateConfig({ maxOpacity: parseFloat((e.target as HTMLInputElement).value) || 1 })"
						/>
						<div class="text-[10px] text-base-500 mt-0.5">Max (slow)</div>
					</div>
				</div>
			</div>
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="opacity-base-width"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Base Width
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
						>{{ config.baseWidth.toFixed(2) }} pt</span
					>
				</div>
				<input
					id="opacity-base-width"
					:value="config.baseWidth"
					type="range"
					min="0.5"
					max="5"
					step="0.25"
					:disabled="disabled"
					:class="sliderClass"
					@input="e => updateConfig({ baseWidth: parseFloat((e.target as HTMLInputElement).value) })"
				/>
			</div>
			<label class="flex items-center gap-2 text-xs text-base-700 dark:text-base-400 cursor-pointer">
				<input
					type="checkbox"
					:checked="config.invertVelocity"
					:disabled="disabled"
					class="rounded border-base-300 dark:border-base-600 text-accent-primary-500 focus:ring-accent-primary-500 disabled:opacity-50"
					@change="e => updateConfig({ invertVelocity: (e.target as HTMLInputElement).checked })"
				/>
				Invert (fast = opaque)
			</label>
		</template>

		<!-- Velocity-Color options -->
		<template v-if="config.type === 'velocity-color'">
			<div>
				<label
					class="block text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400 mb-1"
				>
					Color Range
				</label>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<input
							type="color"
							:value="config.slowColor"
							:disabled="disabled"
							class="w-full h-8 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)]"
							@input="e => updateConfig({ slowColor: (e.target as HTMLInputElement).value })"
						/>
						<div class="text-[10px] text-base-500 mt-0.5">Slow</div>
					</div>
					<div>
						<input
							type="color"
							:value="config.fastColor"
							:disabled="disabled"
							class="w-full h-8 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)]"
							@input="e => updateConfig({ fastColor: (e.target as HTMLInputElement).value })"
						/>
						<div class="text-[10px] text-base-500 mt-0.5">Fast</div>
					</div>
				</div>
			</div>
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="color-base-width"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Base Width
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
						>{{ config.baseWidth.toFixed(2) }} pt</span
					>
				</div>
				<input
					id="color-base-width"
					:value="config.baseWidth"
					type="range"
					min="0.5"
					max="5"
					step="0.25"
					:disabled="disabled"
					:class="sliderClass"
					@input="e => updateConfig({ baseWidth: parseFloat((e.target as HTMLInputElement).value) })"
				/>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import AppDropdown from '@/components/common/AppDropdown.vue'
import type { DropdownOption } from '@/components/common/AppDropdown.vue'
import type { StrokeStyleConfig, StrokeStyleType } from '@/types'

const props = defineProps<{
	config: StrokeStyleConfig
	disabled?: boolean
}>()

const emit = defineEmits<{
	'update:config': [config: StrokeStyleConfig]
}>()

const styleOptions: DropdownOption[] = [
	{ value: 'uniform', label: 'Uniform' },
	{ value: 'velocity-width', label: 'Velocity → Width' },
	{ value: 'velocity-opacity', label: 'Velocity → Opacity' },
	{ value: 'velocity-color', label: 'Velocity → Color' },
]

const sliderClass =
	'w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0'

const inputClass =
	'w-full px-2 py-1.5 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:text-base-400 dark:disabled:text-base-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-120'

const updateType = (value: string) => {
	emit('update:config', { ...props.config, type: value as StrokeStyleType })
}

const updateConfig = (partial: Partial<StrokeStyleConfig>) => {
	emit('update:config', { ...props.config, ...partial })
}
</script>
