<template>
	<div class="space-y-3">
		<div class="grid grid-cols-2 gap-3">
			<!-- Time -->
			<div>
				<label
					class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-1"
					>Time Measurement</label
				>
				<div class="text-base font-mono font-light text-base-800 dark:text-base-100">{{ formattedTime }}s</div>
			</div>

			<!-- Point Count -->
			<div>
				<label
					class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-1"
					>Data Points</label
				>
				<div class="text-sm font-mono font-light text-base-800 dark:text-base-100">
					{{ formattedPointCount }}
				</div>
			</div>
		</div>

		<!-- Current State -->
		<div class="space-y-2">
			<!-- Theta -->
			<div>
				<div
					class="flex items-center justify-between text-xs font-mono font-light text-base-500 dark:text-base-400 mb-1"
				>
					<span>θ</span>
					<span>{{ state.theta.toFixed(3) }} rad</span>
				</div>
				<div class="h-1.5 bg-base-200 dark:bg-base-700 rounded-full overflow-hidden">
					<div
						class="h-full bg-accent-primary-500 transition-all duration-100"
						:style="{ width: `${thetaPercent}%` }"
					/>
				</div>
			</div>

			<!-- Phi -->
			<div>
				<div
					class="flex items-center justify-between text-xs font-mono font-light text-base-500 dark:text-base-400 mb-1"
				>
					<span>φ</span>
					<span>{{ state.phi.toFixed(3) }} rad</span>
				</div>
				<div class="h-1.5 bg-base-200 dark:bg-base-700 rounded-full overflow-hidden">
					<div class="h-full bg-accent-primary-500 transition-all duration-100" :style="{ width: `${phiPercent}%` }" />
				</div>
			</div>

			<!-- Theta Dot -->
			<div>
				<div
					class="flex items-center justify-between text-xs font-mono font-light text-base-500 dark:text-base-400 mb-1"
				>
					<span>θ̇</span>
					<span>{{ state.thetaDot.toFixed(3) }} rad/s</span>
				</div>
				<div class="h-1.5 bg-base-200 dark:bg-base-700 rounded-full overflow-hidden">
					<div
						class="h-full bg-accent-secondary-500 dark:bg-accent-secondary-300 transition-all duration-100"
						:style="{ width: `${thetaDotPercent}%` }"
					/>
				</div>
			</div>

			<!-- Phi Dot -->
			<div>
				<div
					class="flex items-center justify-between text-xs font-mono font-light text-base-500 dark:text-base-400 mb-1"
				>
					<span>φ̇</span>
					<span>{{ state.phiDot.toFixed(3) }} rad/s</span>
				</div>
				<div class="h-1.5 bg-base-200 dark:bg-base-700 rounded-full overflow-hidden">
					<div
						class="h-full bg-accent-secondary-500 dark:bg-accent-secondary-300 transition-all duration-100"
						:style="{ width: `${phiDotPercent}%` }"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PendulumState } from '@/types'

const props = defineProps<{
	state: PendulumState
	pointCount: number
}>()

const formattedTime = computed(() => props.state.time.toFixed(2))
const formattedPointCount = computed(() => (props.state.time === 0 ? '0' : props.pointCount.toLocaleString()))

const thetaPercent = computed(() => ((props.state.theta + Math.PI) / (2 * Math.PI)) * 100)
const phiPercent = computed(() => (props.state.phi / Math.PI) * 100)
const thetaDotPercent = computed(() => Math.min((Math.abs(props.state.thetaDot) / 10) * 100, 100))
const phiDotPercent = computed(() => Math.min((Math.abs(props.state.phiDot) / 10) * 100, 100))
</script>
