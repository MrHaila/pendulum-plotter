import type { SimulationConfig } from '@/types'
import type { SimulationMode } from './useSimulation'
import type { TrimOverrides } from '@/core/trimming'
import { getShareQueryParam, decodeShareLink } from '@/utils/shareLink'

export interface AppInitialState {
	config: SimulationConfig
	mode: SimulationMode
	steps: number
	trimStart: number
	trimEnd: number
	trimOverrides: TrimOverrides | null
	autoPlay: boolean
	isFromSharedLink: boolean
}

/**
 * Handles app initialization by parsing query parameters and merging with defaults
 */
export function useAppInitialization(defaultConfig: SimulationConfig): AppInitialState {
	const shareParam = getShareQueryParam()

	// No shared link - return defaults
	if (!shareParam) {
		return {
			config: defaultConfig,
			mode: 'realtime',
			steps: 2000,
			trimStart: 0,
			trimEnd: 0,
			trimOverrides: null,
			autoPlay: false,
			isFromSharedLink: false,
		}
	}

	// Decode shared link
	const sharedState = decodeShareLink(shareParam)

	// Invalid shared link - return defaults
	if (!sharedState) {
		return {
			config: defaultConfig,
			mode: 'realtime',
			steps: 2000,
			trimStart: 0,
			trimEnd: 0,
			trimOverrides: null,
			autoPlay: false,
			isFromSharedLink: false,
		}
	}

	// Valid shared link - return shared state
	return {
		config: sharedState.config,
		mode: sharedState.mode,
		steps: sharedState.steps ?? 2000,
		trimStart: sharedState.trimStart,
		trimEnd: sharedState.trimEnd,
		trimOverrides: sharedState.trimOverrides,
		autoPlay: sharedState.autoPlay,
		isFromSharedLink: true,
	}
}
