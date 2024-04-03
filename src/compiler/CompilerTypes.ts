import { AltFormatList, BaseSetting, ColorFormat, CSSSetting, SelectOption } from 'src/compiler/Types';
import { TreeSetting } from 'src/compiler/Compiler';

export interface BaseCompilerSetting {
	id: string;
	title: string;
	description?: string;
}

export interface HeadingCompilerSetting extends BaseCompilerSetting {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	collapsed?: boolean;
	children: TreeSetting<CSSSetting>[];
}

export interface InfoTextCompilerSetting extends BaseCompilerSetting {
	markdown?: boolean;
}

export interface ClassToggleCompilerSetting extends BaseCompilerSetting {
	/**
	 * @default false
	 */
	default?: boolean;
	/**
	 * @default false
	 */
	addCommand?: boolean;
	/**
	 * The CSS to apply when this toggle is active.
	 */
	activeCSS: string;
	/**
	 * The CSS to apply when this toggle is inactive.
	 */
	inactiveCSS: string;
}

export interface CompilerCSSSelectOption {
	/**
	 * @default value
	 */
	label?: string;
	value: string;
	/**
	 * The CSS to apply when this option is selected.
	 */
	selectedCSS: string;
}

export interface ClassSelectCompilerSettingVariation1 extends BaseCompilerSetting {
	default?: string;
	allowEmpty: false;
	options: CompilerCSSSelectOption[];
}

export interface ClassSelectCompilerSettingVariation2 extends BaseCompilerSetting {
	default: string;
	allowEmpty: true;
	options: CompilerCSSSelectOption[];
}

export type ClassSelectCompilerSetting = ClassSelectCompilerSettingVariation1 | ClassSelectCompilerSettingVariation2;

export interface VariableTextCompilerSetting extends BaseCompilerSetting {
	default: string;
	quotes?: boolean;
}

export interface VariableNumberCompilerSetting extends BaseCompilerSetting {
	default: number;
	format?: string;
}

export interface VariableNumberSliderCompilerSetting extends BaseCompilerSetting {
	default: number;
	min: number;
	max: number;
	step: number;
	format?: string;
}

export interface VariableSelectCompilerSetting extends BaseCompilerSetting {
	default: string;
	options: (string | SelectOption)[];
	quotes?: boolean;
}

export interface VariableColorCompilerSetting extends BaseCompilerSetting {
	default?: string;
	format: ColorFormat;
	'alt-format'?: AltFormatList;
	opacity?: boolean;
}

export type CompilerCSSSetting =
	| HeadingCompilerSetting
	| InfoTextCompilerSetting
	| ClassToggleCompilerSetting
	| ClassSelectCompilerSetting
	| VariableTextCompilerSetting
	| VariableNumberCompilerSetting
	| VariableNumberSliderCompilerSetting
	| VariableSelectCompilerSetting
	| VariableColorCompilerSetting;
