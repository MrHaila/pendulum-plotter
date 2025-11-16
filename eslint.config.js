import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierConfig from '@vue/eslint-config-prettier'

export default defineConfigWithVueTs(
	pluginVue.configs['flat/recommended'],
	vueTsConfigs.recommended,
	prettierConfig,
	{
		rules: {
			semi: ['error', 'never'],
			'comma-dangle': ['error', 'always-multiline'],
		},
	},
	{
		ignores: ['dist', 'node_modules'],
	},
)
