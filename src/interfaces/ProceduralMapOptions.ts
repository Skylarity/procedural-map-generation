import {Biome} from "./Biome";
import {Falloff} from "./Falloff";

export interface ProceduralMapOptions {
	elevationSeed?: string | number;
	moistureSeed?: string | number;
	showElevation?: boolean;
	showMoisture?: boolean;
	alwaysMountains?: boolean;
	heightCurve?: number;
	falloff?: Falloff;
	elevationOctaves?: number[];
	moistureOctaves?: number[];
	showShadows?: boolean;
	shadowIntensity?: number;
	biomes?: Biome[];
}
