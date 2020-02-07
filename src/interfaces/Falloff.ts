import {FalloffType} from "../enums/FalloffType";

export interface Falloff {
	enabled: boolean;
	method: FalloffType;
	distance: number;
	a: number;
	b: number;
	c: number;
}
