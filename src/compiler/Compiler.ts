import {
	ClassSelectSetting,
	ClassToggleSetting,
	CSSSetting,
	HeadingSetting,
	InfoTextSetting,
	ParsedCSSSettings,
	ParsedCSSSettingsBase,
	VariableColorSetting,
	VariableNumberSetting,
	VariableNumberSliderSetting,
	VariableSelectSetting,
	VariableTextSetting,
} from 'src/compiler/Types';
import { stringify } from 'yaml';
import * as fs from 'node:fs/promises';
import {
	ClassSelectCompilerSetting,
	ClassToggleCompilerSetting,
	CompilerCSSSelectOption,
	CompilerCSSSetting,
	HeadingCompilerSetting,
	InfoTextCompilerSetting,
	VariableColorCompilerSetting,
	VariableNumberCompilerSetting,
	VariableNumberSliderCompilerSetting,
	VariableSelectCompilerSetting,
	VariableTextCompilerSetting,
} from 'src/compiler/CompilerTypes';

export interface StyleSettingsCompilerOptions {
	/**
	 * The name of the style settings section. This is usually the name of your theme or plugin.
	 */
	name: string;
	/**
	 * The unique identifier of the style settings section. This is usually the id of your theme or plugin.
	 */
	id: string;
	/**
	 * Whether the style settings section is collapsed by default.
	 *
	 * @default true
	 */
	collapsed?: boolean;
	/**
	 * The folder where the styles are located.
	 */
	stylesFolder: string;
	/**
	 * The name of the file that is the entry point for the styles.
	 */
	stylesEntry: string;
	settings: TreeSetting<CompilerCSSSetting>[];
}

export interface SettingsConversionIntermediate {
	setting: CSSSetting;
	children?: SettingsConversionIntermediate[];
	codeSnippets?: string[];
}

export class StyleSettingsCompiler {
	options: StyleSettingsCompilerOptions;

	constructor(options: StyleSettingsCompilerOptions) {
		this.options = options;
	}

	compileString(): string {
		const [convertedOptions, intermediateSettings] = this.convert();

		const [cssSettings, codeSnippets] = this.flattenSettings(intermediateSettings);

		const completeSettings: ParsedCSSSettings = {
			...convertedOptions,
			settings: cssSettings,
		};

		const yamlComment = this.toYamlComment(completeSettings);

		return `${yamlComment}\n\n${codeSnippets.join('\n\n')}`;
	}

	async compile(): Promise<void> {
		await fs.cp(this.options.stylesFolder, 'output', { recursive: true });
		const fileContent = this.compileString();
		const entryContent = (await fs.readFile('output/' + this.options.stylesEntry, 'utf-8')) + '\n\n' + fileContent;
		await fs.writeFile('output/' + this.options.stylesEntry, entryContent);
	}

	private convert(): [ParsedCSSSettingsBase, SettingsConversionIntermediate[]] {
		return [
			{
				name: this.options.name,
				id: this.options.id,
				collapsed: this.options.collapsed ?? true,
			},
			this.options.settings.map(setting => setting.convert()),
		];
	}

	private flattenSettings(settings: SettingsConversionIntermediate[]): [CSSSetting[], string[]] {
		const cssSettings: CSSSetting[] = [];
		const codeSnippets: string[] = [];

		this.recFlattenSettings(settings, cssSettings, codeSnippets);

		return [cssSettings, codeSnippets];
	}

	private recFlattenSettings(settings: SettingsConversionIntermediate[], cssSettings: CSSSetting[], codeSnippets: string[]): void {
		for (const setting of settings) {
			cssSettings.push(setting.setting);

			if (setting.codeSnippets) {
				codeSnippets.push(...setting.codeSnippets);
			}

			if (setting.children) {
				this.recFlattenSettings(setting.children, cssSettings, codeSnippets);
			}
		}
	}

	private toYamlComment(cssSettings: ParsedCSSSettings): string {
		const yaml = stringify(cssSettings);
		return `/*! @settings\n\n${yaml}\n\n */`;
	}
}

export abstract class TreeSetting<T extends CompilerCSSSetting> {
	setting: T;

	constructor(setting: T) {
		this.setting = setting;
	}

	abstract convert(): SettingsConversionIntermediate;
}

class HeadingTreeSetting extends TreeSetting<HeadingCompilerSetting> {
	constructor(setting: HeadingCompilerSetting) {
		super(setting);
	}

	convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'heading',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				level: this.setting.level,
				collapsed: this.setting.collapsed,
			} satisfies HeadingSetting,
			children: this.setting.children.map(child => child.convert()),
		};
	}
}

class ClassToggleTreeSetting extends TreeSetting<ClassToggleCompilerSetting> {
	activeCSS: string;
	inactiveCSS: string;
	onByDefault: boolean;

	constructor(setting: ClassToggleCompilerSetting) {
		super(setting);

		this.activeCSS = setting.activeCSS;
		this.inactiveCSS = setting.inactiveCSS;
		this.onByDefault = setting.default ?? false;
	}

	public convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'class-toggle',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				default: this.onByDefault,
				addCommand: this.setting.addCommand,
			} satisfies ClassToggleSetting,
			codeSnippets: [this.convertActiveCode(), this.convertInactiveCode()],
		};
	}

	private convertActiveCode(): string {
		const selectors = [`body.css-settings-manager.${this.setting.id}`];
		if (this.onByDefault) {
			selectors.push('body:not(.css-settings-manager)');
		}
		return `:is(${selectors.join(', ')}) {\n${this.activeCSS}\n}`;
	}

	private convertInactiveCode(): string {
		const selectors = [`body.css-settings-manager:not(.${this.setting.id})`];
		if (!this.onByDefault) {
			selectors.push('body:not(.css-settings-manager)');
		}
		return `:is(${selectors.join(', ')}) {\n${this.inactiveCSS}\n}`;
	}
}

class ClassSelectTreeSetting extends TreeSetting<ClassSelectCompilerSetting> {
	constructor(setting: ClassSelectCompilerSetting) {
		super(setting);
	}

	public convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'class-select',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				default: this.setting.default as string,
				allowEmpty: this.setting.allowEmpty,
				options: this.setting.options.map(x => {
					if (x.label === undefined) {
						return x.value;
					} else {
						return {
							label: x.label,
							value: x.value,
						};
					}
				}),
			} satisfies ClassSelectSetting,
			codeSnippets: this.setting.options.map(option => this.convertOptionCode(option)),
		};
	}

	convertOptionCode(option: CompilerCSSSelectOption): string {
		const selectors = [`body.css-settings-manager.${this.setting.id}`];
		if (this.setting.default === option.value) {
			selectors.push('body:not(.css-settings-manager)');
		}

		return `:is(${selectors.join(', ')}) {\n${option.selectedCSS}\n}`;
	}
}

class InfoTextTreeSetting extends TreeSetting<InfoTextCompilerSetting> {
	constructor(setting: InfoTextCompilerSetting) {
		super(setting);
	}

	public convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'info-text',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				markdown: this.setting.markdown,
			} satisfies InfoTextSetting,
		};
	}
}

class VariableTextTreeSetting extends TreeSetting<VariableTextCompilerSetting> {
	constructor(setting: VariableTextCompilerSetting) {
		super(setting);
	}

	public convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'variable-text',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				default: this.setting.default,
				quotes: this.setting.quotes,
			} satisfies VariableTextSetting,
		};
	}
}

class VariableNumberTreeSetting extends TreeSetting<VariableNumberCompilerSetting> {
	constructor(setting: VariableNumberCompilerSetting) {
		super(setting);
	}

	public convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'variable-number',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				default: this.setting.default,
				format: this.setting.format,
			} satisfies VariableNumberSetting,
		};
	}
}

class VariableNumberSliderTreeSetting extends TreeSetting<VariableNumberSliderCompilerSetting> {
	constructor(setting: VariableNumberSliderCompilerSetting) {
		super(setting);
	}

	public convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'variable-number',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				default: this.setting.default,
				max: this.setting.max,
				min: this.setting.min,
				step: this.setting.step,
				format: this.setting.format,
			} satisfies VariableNumberSliderSetting,
		};
	}
}

class VariableSelectTreeSetting extends TreeSetting<VariableSelectCompilerSetting> {
	constructor(setting: VariableSelectCompilerSetting) {
		super(setting);
	}

	public convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'variable-select',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				default: this.setting.default,
				options: this.setting.options,
				quotes: this.setting.quotes,
			} satisfies VariableSelectSetting,
		};
	}
}

class VariableColorTreeSetting extends TreeSetting<VariableColorCompilerSetting> {
	constructor(setting: VariableColorCompilerSetting) {
		super(setting);
	}

	public convert(): SettingsConversionIntermediate {
		return {
			setting: {
				type: 'variable-color',
				id: this.setting.id,
				title: this.setting.title,
				description: this.setting.description,
				default: this.setting.default,
				format: this.setting.format,
				'alt-format': this.setting['alt-format'],
				opacity: this.setting.opacity,
			} satisfies VariableColorSetting,
		};
	}
}

class SettingsFactory {
	createHeading(setting: HeadingCompilerSetting): HeadingTreeSetting {
		return new HeadingTreeSetting(setting);
	}

	createInfoText(setting: InfoTextCompilerSetting): InfoTextTreeSetting {
		return new InfoTextTreeSetting(setting);
	}

	createClassToggle(setting: ClassToggleCompilerSetting): ClassToggleTreeSetting {
		return new ClassToggleTreeSetting(setting);
	}

	createClassSelect(setting: ClassSelectCompilerSetting): ClassSelectTreeSetting {
		return new ClassSelectTreeSetting(setting);
	}

	createVariableText(setting: VariableTextCompilerSetting): VariableTextTreeSetting {
		return new VariableTextTreeSetting(setting);
	}

	creteVariableNumber(setting: VariableNumberCompilerSetting): VariableNumberTreeSetting {
		return new VariableNumberTreeSetting(setting);
	}

	creteVariableNumberSlider(setting: VariableNumberSliderCompilerSetting): VariableNumberSliderTreeSetting {
		return new VariableNumberSliderTreeSetting(setting);
	}

	createVariableSelect(setting: VariableSelectCompilerSetting): VariableSelectTreeSetting {
		return new VariableSelectTreeSetting(setting);
	}

	createVariableColor(setting: VariableColorCompilerSetting): VariableColorTreeSetting {
		return new VariableColorTreeSetting(setting);
	}
}

export const SETTINGS = new SettingsFactory();

export function css(stringParts: TemplateStringsArray, ...values: unknown[]) {
	let result = '';

	for (let i = 0; i < values.length; i++) {
		result += stringParts[i];
		result += `${values[i]}`;
	}

	result += stringParts.at(-1);

	return result;
}
