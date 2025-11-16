<template>
	<div class="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border-2 border-blue-300">
		<h3 class="text-sm font-semibold mb-3 text-blue-800">Runtime State</h3>

		<div class="space-y-3">
			<!-- Theta -->
			<div>
				<label class="block text-xs font-medium text-blue-700 mb-1">
					θ (Azimuthal): {{ state.theta.toFixed(3) }} rad
				</label>
				<div class="h-2 bg-blue-200 rounded-full overflow-hidden">
					<div
						class="h-full bg-blue-500 transition-all duration-100"
						:style="{ width: `${((state.theta + Math.PI) / (2 * Math.PI)) * 100}%` }"
					/>
				</div>
			</div>

			<!-- Phi -->
			<div>
				<label class="block text-xs font-medium text-blue-700 mb-1"> φ (Polar): {{ state.phi.toFixed(3) }} rad </label>
				<div class="h-2 bg-purple-200 rounded-full overflow-hidden">
					<div
						class="h-full bg-purple-500 transition-all duration-100"
						:style="{ width: `${(state.phi / Math.PI) * 100}%` }"
					/>
				</div>
			</div>

			<!-- Theta Dot -->
			<div>
				<label class="block text-xs font-medium text-blue-700 mb-1">
					θ̇ (Angular velocity): {{ state.thetaDot.toFixed(3) }} rad/s
				</label>
				<div class="h-2 bg-green-200 rounded-full overflow-hidden">
					<div
						class="h-full bg-green-500 transition-all duration-100"
						:style="{ width: `${Math.min((Math.abs(state.thetaDot) / 10) * 100, 100)}%` }"
					/>
				</div>
			</div>

			<!-- Phi Dot -->
			<div>
				<label class="block text-xs font-medium text-blue-700 mb-1">
					φ̇ (Angular velocity): {{ state.phiDot.toFixed(3) }} rad/s
				</label>
				<div class="h-2 bg-yellow-200 rounded-full overflow-hidden">
					<div
						class="h-full bg-yellow-500 transition-all duration-100"
						:style="{ width: `${Math.min((Math.abs(state.phiDot) / 10) * 100, 100)}%` }"
					/>
				</div>
			</div>

			<!-- Time -->
			<div class="pt-2 border-t border-blue-200">
				<label class="block text-xs font-medium text-blue-700 mb-1"> Elapsed Time </label>
				<div class="text-lg font-mono font-semibold text-blue-900">{{ state.time.toFixed(2) }}s</div>
			</div>

			<!-- Point Count -->
			<div class="pt-1">
				<label class="block text-xs font-medium text-blue-700 mb-1"> Points Generated </label>
				<div class="text-sm font-mono text-blue-800">{{ pointCount.toLocaleString() }}</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PendulumState } from '@/types'

defineProps<{
	state: PendulumState
	pointCount: number
}>()
</script>
