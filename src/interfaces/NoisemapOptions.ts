export interface NoisemapOptions {
	seed: number | string;
	octaves: number[];
	useHeightCurve?: boolean;
	useDistance?: boolean;
	normalize?: boolean;
}
