import {FalloffType} from "../enums/FalloffType";

export interface Falloff {
	enabled: boolean;
	method: FalloffType;
	distance: number;
	smoothness: number;
	intensity: number;
	amplification: number;
}
