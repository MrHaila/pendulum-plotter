<template>
	<div class="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
		<h3 class="text-sm font-semibold mb-3 text-gray-700">Simulation State</h3>
		<dl class="space-y-2 text-xs font-mono">
			<div class="flex justify-between">
				<dt class="text-gray-500">Time:</dt>
				<dd class="font-semibold">{{ state.time.toFixed(2) }}s</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-gray-500">θ (theta):</dt>
				<dd class="font-semibold">{{ state.theta.toFixed(3) }} rad</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-gray-500">φ (phi):</dt>
				<dd class="font-semibold">{{ state.phi.toFixed(3) }} rad</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-gray-500">θ̇:</dt>
				<dd class="font-semibold">{{ state.thetaDot.toFixed(3) }} rad/s</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-gray-500">φ̇:</dt>
				<dd class="font-semibold">{{ state.phiDot.toFixed(3) }} rad/s</dd>
			</div>
			<div class="flex justify-between border-t border-gray-200 pt-2 mt-2">
				<dt class="text-gray-500">Points:</dt>
				<dd class="font-semibold">{{ pointCount }}</dd>
			</div>
		</dl>
	</div>
</template>

<script setup lang="ts">
import type { PendulumState } from '@/types'

defineProps<{
	state: PendulumState
	pointCount: number
}>()
</script>
