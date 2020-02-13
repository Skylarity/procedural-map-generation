/**
 * @author Skyler Rexroad <skyler.rexroad@gmail.com>
 */

import * as d3 from "d3";
import Alea from "alea";
import SimplexNoise from "simplex-noise";

import {ProceduralMapOptions} from "../interfaces/ProceduralMapOptions";
import {NoisemapOptions} from "../interfaces/NoisemapOptions";
import {Falloff} from "../interfaces/Falloff";
import {FalloffType} from "../enums/FalloffType";
import {Biome} from "../interfaces/Biome";

export class ProceduralMap {
	/***** RNG *****/
	elevationSeed: number | string = "elevation";
	moistureSeed: number | string = "moisture";

	/***** MAP *****/
	/* General */
	// Default to a small and performant image size
	size: number = 256;
	zoom: number = 1;
	showElevation: boolean = false;
	showMoisture: boolean = false;
	private elevationColorScale: d3.ScaleLinear<string, string> = d3
		.scaleLinear<string, string>()
		.domain([0, 1])
		.range(["black", "white"]);
	private moistureColorScale: d3.ScaleLinear<string, string> = d3
		.scaleLinear<string, string>()
		.domain([0, 1])
		.range(["blue", "tan"]);
	alwaysMountains: boolean = true;

	/* ProcGen */
	elevationMap: number[] = [];
	moistureMap: number[] = [];
	elevationOctaves: number[] = [1, 0.74, 0.51, 0.29, 0.13, 0.07, 0.05, 0.02];
	moistureOctaves: number[] = [1, 0.75, 0.33, 0.33, 0.33, 0.5, 0.25, 0, 0, 0.1];

	// To increase mountain contrast
	heightCurve: number = 3;

	// For islands:
	falloff: Falloff = {
		enabled: true,
		method: FalloffType.Euclidean,
		distance: 0.67,
		smoothness: 0.05,
		intensity: 1,
		amplification: 1.5
	};

	/* Color */
	showShadows: boolean = true;
	shadowIntensity: number = 0.15;
	biomes: Biome[] = [
		// Water
		{
			label: "Deep Water",
			maxHeight: 0.1,
			moisture: 1,
			shadows: false,
			color: d3.rgb("#44b0f2")
		},
		{
			label: "Water",
			maxHeight: 0.18,
			moisture: 0.8,
			shadows: false,
			color: d3.rgb("#35c2fa")
		},
		{
			label: "Tropical Water",
			maxHeight: 0.18,
			moisture: 1,
			shadows: false,
			color: d3.rgb("#96e2d7")
		},
		{
			label: "Shallow Water",
			maxHeight: 0.2,
			moisture: 1,
			shadows: false,
			color: d3.rgb("#96e2d7")
		},
		// Low land
		{
			label: "Beach",
			maxHeight: 0.22,
			moisture: 0.7,
			shadows: true,
			color: d3.rgb("#fec998")
		},
		{
			label: "Marsh Beach",
			maxHeight: 0.22,
			moisture: 1,
			shadows: true,
			color: d3.rgb("#9c8670")
		},
		{
			label: "Desert",
			maxHeight: 0.4,
			moisture: 0.2,
			shadows: true,
			color: d3.rgb("#fda27c")
		},
		{
			label: "Grass",
			maxHeight: 0.4,
			moisture: 0.7,
			shadows: true,
			color: d3.rgb("#63bf61")
		},
		{
			label: "Marsh",
			maxHeight: 0.4,
			moisture: 1,
			shadows: true,
			color: d3.rgb("#99c66f")
		},
		// High land
		{
			label: "Forest",
			maxHeight: 0.6,
			moisture: 0.4,
			shadows: true,
			color: d3.rgb("#38824f")
		},
		{
			label: "Evergreens",
			maxHeight: 0.6,
			moisture: 1,
			shadows: true,
			color: d3.rgb("#366e48")
		},
		// Mountain
		{
			label: "Mountain Crags",
			maxHeight: 0.75,
			moisture: 0.4,
			shadows: true,
			color: d3.rgb("#727394")
		},
		{
			label: "Mountain",
			maxHeight: 0.75,
			moisture: 1,
			shadows: true,
			color: d3.rgb("#666261")
		},
		{
			label: "Mountain Peaks",
			maxHeight: 1,
			moisture: 0.5,
			shadows: true,
			color: d3.rgb("#727394")
		},
		{
			label: "Snow",
			maxHeight: 1,
			moisture: 1,
			shadows: true,
			color: d3.rgb("#ffffff")
		}
	];

	/***** CLASS INITIALIZATION *****/
	constructor(options: ProceduralMapOptions) {
		this.elevationSeed = options.elevationSeed !== undefined ? options.elevationSeed : this.elevationSeed;
		this.moistureSeed = options.moistureSeed !== undefined ? options.moistureSeed : this.moistureSeed;
		this.showElevation = options.showElevation !== undefined ? options.showElevation : this.showElevation;
		this.showMoisture = options.showMoisture !== undefined ? options.showMoisture : this.showMoisture;
		this.alwaysMountains = options.alwaysMountains !== undefined ? options.alwaysMountains : this.alwaysMountains;
		this.elevationOctaves =
			options.elevationOctaves !== undefined ? options.elevationOctaves : this.elevationOctaves;
		this.moistureOctaves = options.moistureOctaves !== undefined ? options.moistureOctaves : this.moistureOctaves;
		this.heightCurve = options.heightCurve !== undefined ? options.heightCurve : this.heightCurve;
		this.falloff = options.falloff !== undefined ? options.falloff : this.falloff;
		this.showShadows = options.showShadows !== undefined ? options.showShadows : this.showShadows;
		this.shadowIntensity = options.shadowIntensity !== undefined ? options.shadowIntensity : this.shadowIntensity;
		this.biomes = options.biomes !== undefined ? options.biomes : this.biomes;
	}

	/***** MAP GENERATION *****/
	private generateNoisemap(options: NoisemapOptions): number[] {
		// Initialize noise generator
		const rng = Alea(options.seed);
		const simplex = new SimplexNoise(rng);
		const noise = (nx: number, ny: number): number => simplex.noise2D(nx, ny) / 2 + 0.5;

		// Initialize map variables
		let noiseMap: number[] = [];

		// Loop over map area and generate noise
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				// Initialize this sample
				const noiseX: number = (x + this.size) / this.size - 0.5;
				const noiseY: number = (y + this.size) / this.size - 0.5;
				let sample: number = 0;

				// Add octaves of noise to increase detail
				let frequency: number = 1;
				options.octaves.forEach((octave: number) => {
					sample += octave * noise(this.zoom * frequency * noiseX, this.zoom * frequency * noiseY);

					// Increase frequency exponentially
					frequency *= 2;
				});
				sample /= options.octaves.reduce((a: number, b: number) => a + b);

				// Apply curve to amplify noise peaks
				if (options.useHeightCurve) {
					sample = Math.pow(sample, this.heightCurve);
				}

				// Add sample to map
				noiseMap.push(sample);
			}
		}

		// Normalize noise between 0 and 1 to ensure mountain generation
		if (options.normalize) {
			noiseMap = this.normalize(noiseMap);
		}

		// Ensure no values escape [0, 1] range
		noiseMap = noiseMap.map((n: number) => {
			return Math.min(Math.max(n, 0), 1);
		});

		// Create island with distance-based falloff
		// (Do this after normalization to preserve map)
		if (options.useDistance) {
			let distanceScale = d3
				.scaleLinear()
				.domain([0, this.falloff.distance, 1])
				.range([1, 1, 0]);

			noiseMap = noiseMap.map((sample: number, i: number) => {
				let distance: number = 0;
				const x: number = i % this.size;
				const y: number = Math.floor(i / this.size);
				const noiseX: number = (x + this.size) / this.size - 0.5;
				const noiseY: number = (y + this.size) / this.size - 0.5;

				switch (this.falloff.method) {
					case FalloffType.Manhattan:
						distance = 2 * this.manhattanDistance(noiseX, noiseY);
						break;
					case FalloffType.Euclidean: // Fall back to euclidian
					default:
						distance = 2 * this.euclideanDistance(noiseX, noiseY);
				}
				sample *= distanceScale(distance);
				return sample;
			});
		}

		return noiseMap;
	}

	public generateMap() {
		this.elevationMap = this.generateNoisemap({
			seed: this.elevationSeed,
			octaves: this.elevationOctaves,
			useHeightCurve: true,
			useDistance: this.falloff.enabled,
			normalize: this.alwaysMountains
		});
		this.moistureMap = this.generateNoisemap({
			seed: this.moistureSeed,
			octaves: this.moistureOctaves,
			normalize: true
		});
	}

	/***** MAP RENDERING *****/
	public generateMapImage(): ImageData | null {
		let image: number[] = [];

		// Add colors to image data array
		if (this.elevationMap.length > 0 && this.moistureMap.length > 0) {
			this.elevationMap.forEach((elevation: number, elevationIndex: number) => {
				const moisture = this.moistureMap[elevationIndex];

				let biome: Biome = {...this.getBiome(elevation, moisture)}; // clone biome

				// Add shading
				if (this.showShadows && biome.shadows && !this.showElevation && !this.showMoisture) {
					const x: number = elevationIndex % this.size;
					const y: number = Math.floor(elevationIndex / this.size);
					const prevY = y > 0 ? y - 1 : y;
					const prevX = x > 0 ? x - 1 : x;
					const previousIsHigher = this.elevationMap[prevX + prevY * this.size] > elevation;

					biome.color = previousIsHigher ? biome.color.darker(this.shadowIntensity) : biome.color;
				}

				// Add pixel to image
				image.push(biome.color.r);
				image.push(biome.color.g);
				image.push(biome.color.b);
				image.push(255 * biome.color.opacity);
			});

			// Convert regular array to usable image
			return new ImageData(Uint8ClampedArray.from(image), this.size, this.size);
		} else {
			return null;
		}
	}

	private sortBiomes() {
		// Sort by height, then moisture
		this.biomes = this.biomes.sort((a: Biome, b: Biome) => {
			let elevation = a.maxHeight < b.maxHeight ? -1 : a.maxHeight === b.maxHeight ? 0 : 1;
			let moisture = 0;

			if (elevation === 0) {
				moisture = a.moisture < b.moisture ? -1 : a.moisture === b.moisture ? 0 : 1;
			}
			return elevation !== 0 ? elevation : moisture;
		});
	}

	public getBiome(elevation: number, moisture: number): Biome {
		// Make sure colors are usable
		this.sortBiomes();

		// Initialize with error color
		let biome: Biome = {
			label: "Something went wrong!",
			maxHeight: 1,
			moisture: 1,
			shadows: false,
			color: d3.rgb("#ed27f7")
		};

		if (this.showElevation) {
			biome = {
				label: "Elevation",
				maxHeight: 1,
				moisture: 1,
				shadows: false,
				color: d3.rgb(this.elevationColorScale(elevation))
			};
		} else if (this.showMoisture) {
			biome = {
				label: "Moisture",
				maxHeight: 1,
				moisture: 1,
				shadows: false,
				color: d3.rgb(this.moistureColorScale(moisture))
			};
		} else {
			// Get possible biomes for elevation
			let biomeChoices: Biome[] = [];
			for (let i = 0; i < this.biomes.length; ++i) {
				if (elevation <= this.biomes[i].maxHeight) {
					biomeChoices.push(this.biomes[i]);
				}
			}
			// Get correct color for elevation and moisture
			for (let i = 0; i < biomeChoices.length; ++i) {
				biome = biomeChoices[i];
				if (moisture <= biomeChoices[i].moisture) {
					break;
				}
			}
		}

		return biome;
	}

	/***** UTILITY *****/
	private normalize(arr: number[], min?: number, max?: number): number[] {
		const normalScale = d3
			.scaleLinear()
			.domain([min ? min : d3.min(arr) || 0, max ? max : d3.max(arr) || 0])
			.range([0, 1]);

		return arr.map(normalScale);
	}

	private manhattanDistance(x: number, y: number): number {
		const maxDistance: number = 1;
		return Math.max(Math.abs(x - maxDistance), Math.abs(y - maxDistance));
	}
	private euclideanDistance(x: number, y: number): number {
		const maxDistance: number = 1;
		return Math.hypot(x - maxDistance, y - maxDistance);
	}
}
