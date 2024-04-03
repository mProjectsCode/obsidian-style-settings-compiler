export interface BaseSetting {
	id: string;
	title: string;
	description?: string;
	type:
		| 'heading'
		| 'info-text'
		| 'class-toggle'
		| 'class-select'
		| 'variable-text'
		| 'variable-number'
		| 'variable-number-slider'
		| 'variable-select'
		| 'variable-color';
}

/**
 * A heading element for organizing settings.
 *
 * Headings can be used to organize and group settings into collapsable nested sections.
 * Along with the required attributes, headings must contain a level attribute between 1 and 6, and can optionally contain a collapsed attribute.
 */
export interface HeadingSetting extends BaseSetting {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	/**
	 * @default true
	 */
	collapsed?: boolean;
}

/**
 * info-text displays arbitrary informational text to users. The description may contain markdown if markdown is set to true.
 */
export interface InfoTextSetting extends BaseSetting {
	/**
	 * @default false
	 */
	markdown?: boolean;
}

/**
 * A switch to toggle classes on the body element.
 *
 * class-toggles will toggle a css class on and off of the body element, allowing CSS themes and snippets to toggle features on and off.
 * The id of the setting will be used as the class name. The default parameter can optionally be set to true.
 * class-toggle also supports the addCommand property.
 * When set to true a command will be added to obsidian to toggle the class via a hotkey or the command palette.
 */
export interface ClassToggleSetting extends BaseSetting {
	default?: boolean;
	/**
	 * @default false
	 */
	addCommand?: boolean;
}

export interface SelectOption {
	label: string;
	value: string;
}

export interface ClassSelectSettingVariation1 extends BaseSetting {
	default?: string;
	allowEmpty: false;
	options: Array<string | SelectOption>;
}

export interface ClassSelectSettingVariation2 extends BaseSetting {
	default: string;
	allowEmpty: true;
	options: Array<string | SelectOption>;
}

/**
 * A dropdown menu of predefined options to add classes on the body element.
 *
 * `class-select` creates a dropdown of predefined options for a CSS variable.
 * The `id` of the setting will be used as the variable name.
 * - When `allowEmpty` is `false`, a `default` option must be specified.
 * - When `allowEmpty` `is `true`, the `default` attribute is optional.
 */
export type ClassSelectSetting = ClassSelectSettingVariation1 | ClassSelectSettingVariation2;

/**
 * A text-based CSS variable.
 *
 * `variable-text` represents any text based CSS value.
 * The `id` of the setting will be used as the variable name.
 * The output will be wrapped in quotes if `quotes` is set to true.
 * `variable-text` settings require a `default` attribute.
 */
export interface VariableTextSetting extends BaseSetting {
	default: string;
	quotes?: boolean;
}

/**
 * A numeric CSS variable.
 *
 * `variable-number` represents any numeric CSS value.
 * The `id` of the setting will be used as the variable name.
 * `variable-number` settings require a `default` attribute.
 *
 * Optionally, a `format` attribute can be set. This value will be appended to the number. Eg `format: px` will result in `42px`.
 */
export interface VariableNumberSetting extends BaseSetting {
	default: number;
	format?: string;
}

/**
 * A numeric CSS variable represented by a slider.
 *
 * `variable-number-slider` represents any numeric CSS value.
 * The `id` of the setting will be used as the variable name.
 * `variable-number-slider` settings require a `default` attribute, as well as these three attributes:
 * - `min`: The minimum possible value of the slider
 * - `max`: The maximum possible value of the slider
 * - `step`: The size of each "tick" of the slider. For example, a step of 100 will only allow the slider to move in increments of 100.
 *
 * Optionally, a `format` attribute can be set. This value will be appended to the number. Eg `format: px` will result in `42px`.
 */
export interface VariableNumberSliderSetting extends BaseSetting {
	default: number;
	min: number;
	max: number;
	step: number;
	format?: string;
}

/**
 * A text-based CSS variable displayed as a dropdown menu of predefined options.
 *
 * `variable-select creates` a dropdown of predefined options for a CSS variable.
 * The `id` of the setting will be used as the variable name.
 * `variable-select` settings require a `default` attribute as well as a list of `options`.
 */
export interface VariableSelectSetting extends BaseSetting {
	default: string;
	options: Array<string | SelectOption>;
	quotes?: boolean;
}

export type ColorFormat = 'hsl' | 'hsl-values' | 'hsl-split' | 'hsl-split-decimal' | 'rgb' | 'rgb-values' | 'rgb-split' | 'hex';

export type AltFormatList = Array<{ id: string; format: ColorFormat }>;

/**
 * A color CSS variable with corresponding color picker.
 *
 * `variable-color` creates a color picker with a variety of output format options.
 * A `default` attribute is required in `hex` or `rgb` format. A `format` attribute is also required.
 *
 * Optional parameters:
 * - Setting `opacity` to `true` will enable opacity support in all output formats.
 * - A list of alternate output formats can be supplied via the `alt-format` setting
 */
export interface VariableColorSetting extends BaseSetting {
	default?: string;
	format: ColorFormat;
	'alt-format'?: AltFormatList;
	opacity?: boolean;
}

export interface ColorGradient extends BaseSetting {
	from: string;
	to: string;
	format: 'hsl' | 'rgb' | 'hex';
	pad?: number;
	step: number;
}

export interface VariableThemedColorSetting extends BaseSetting {
	'default-light': string;
	'default-dark': string;
	format: ColorFormat;
	'alt-format': AltFormatList;
	opacity?: boolean;
}

export type CSSSetting =
	| HeadingSetting
	| InfoTextSetting
	| ClassToggleSetting
	| ClassSelectSetting
	| VariableTextSetting
	| VariableNumberSetting
	| VariableNumberSliderSetting
	| VariableSelectSetting
	| VariableColorSetting;

export interface ParsedCSSSettings {
	name: string;
	id: string;
	collapsed: boolean;
	settings: Array<CSSSetting>;
}

export interface ParsedCSSSettingsBase {
	name: string;
	id: string;
	collapsed: boolean;
}
