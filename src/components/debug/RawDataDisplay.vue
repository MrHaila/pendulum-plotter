<template>
	<div class="absolute inset-0 overflow-hidden pointer-events-none p-2 select-none">
		<div class="grid h-full gap-0.5" style="grid-template-columns: repeat(auto-fit, minmax(70px, 1fr))">
			<div
				v-for="(point, index) in points.slice(1)"
				:key="index"
				class="font-mono text-[7px] text-gray-300 min-h-[20px]"
			>
				{{ point.x.toFixed(2) }}, {{ point.y.toFixed(2) }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Point2D } from '@/types'

defineProps<{
	points: Point2D[]
}>()
</script>
