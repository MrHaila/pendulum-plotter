<template>
	<div class="absolute inset-0 overflow-hidden pointer-events-none p-2 select-none">
		<div ref="gridContainer" class="h-full overflow-y-hidden">
			<div class="grid gap-0.5" style="grid-template-columns: repeat(auto-fit, minmax(70px, 1fr))">
				<div
					v-for="(point, index) in points.slice(1)"
					:key="index"
					class="font-mono text-[7px] text-base-400/30 dark:text-base-500/20 min-h-[20px]"
				>
					{{ point.x.toFixed(2) }}, {{ point.y.toFixed(2) }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Point2D } from '@/types'

const gridContainer = ref<HTMLDivElement | null>(null)

const props = defineProps<{
	points: Point2D[]
}>()

watch(
	() => props.points.length,
	() => {
		nextTick(() => {
			if (gridContainer.value) {
				gridContainer.value.scrollTop = gridContainer.value.scrollHeight
			}
		})
	},
)
</script>
