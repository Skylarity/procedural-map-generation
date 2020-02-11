import * as d3 from "d3";

export interface Biome {
	label: string;
	maxHeight: number;
	moisture: number;
	shadows: boolean;
	color: d3.RGBColor;
}
