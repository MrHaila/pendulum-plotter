import { ref, computed } from 'vue'
import type { AppMode } from '../types'

/**
 * Manages application mode state machine
 * - manual: Default mode, user manually controls simulation, trim resets on each run
 * - auto-run: From shared link, trim preserved, auto-stop at trimEnd
 */
export function useAppMode() {
	const mode = ref<AppMode>('manual')

	const isManualMode = computed(() => mode.value === 'manual')
	const isAutoRunMode = computed(() => mode.value === 'auto-run')

	const setManualMode = () => {
		mode.value = 'manual'
	}

	const setAutoRunMode = () => {
		mode.value = 'auto-run'
	}

	return {
		mode,
		isManualMode,
		isAutoRunMode,
		setManualMode,
		setAutoRunMode,
	}
}
