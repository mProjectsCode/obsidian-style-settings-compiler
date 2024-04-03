import { css, SETTINGS, StyleSettingsCompiler } from 'src/compiler/Compiler';

const compiler = new StyleSettingsCompiler({
	name: 'Test Theme',
	id: 'test-theme',
	collapsed: false,
	stylesFolder: 'src/testTheme',
	stylesEntry: 'index.scss',
	settings: [
		SETTINGS.createClassToggle({
			id: 'test-toggle',
			title: 'Test Toggle',
			default: true,
			addCommand: true,
			activeCSS: css`
				--text-normal: red;
			`,
			inactiveCSS: css`
				--text-normal: blue;
			`,
		}),
		SETTINGS.createClassToggle({
			id: 'test-toggle-2',
			title: 'Test Toggle 2',
			default: false,
			addCommand: true,
			activeCSS: css`
				--text-muted: red;
			`,
			inactiveCSS: css`
				--text-muted: blue;
			`,
		}),
	],
});

/**
 * This will compile the settings by copying the files from the `stylesFolder` to `output`
 * and then attaching the style settings and generated classes to the `styleEntry` file.
 */
await compiler.compile();
