/**
 * @author Skyler Rexroad <skyler.rexroad@gmail.com>
 */

import * as d3 from "d3";
import Alea from "alea";
import SimplexNoise from "simplex-noise";

import {NoisemapOptions} from "../interfaces/NoisemapOptions";

export class ProceduralMap {
	/***** MAP *****/
	// Default to a small and performant width/height
	width: number = 64;
	height: number = 64;

	/***** RNG *****/
	seed: number | string = 0;

	/***** MAP GENERATION *****/
	generateNoisemap(options: NoisemapOptions): number[] {
		// Initialize noise generator
		const rng = Alea(options.seed);
		const simplex = new SimplexNoise(rng);
		const noise = (nx: number, ny: number): number => simplex.noise2D(nx, ny) / 2 + 0.5; // normalize between 0-1

		// Initialize map variables
		const map: number[] = [];

		// Loop over map area and generate noise
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				// Sample noise at (x, y)
				const noiseX = (x + this.width) / this.width - 0.5,
					noiseY = (y + this.height) / this.height - 0.5;

				map.push(noise(noiseX, noiseY));
			}
		}

		return map;
	}

	generateHeightmap(): number[] {
		let heightmap: number[] = this.generateNoisemap({
			seed: this.seed,
			useHeightCurve: true,
			useDistance: true
		});

		return heightmap;
	}

	/***** MAP RENDERING *****/

	render(ctx: CanvasRenderingContext2D) {
		let heightmap: number[] = this.generateHeightmap();

		// let heightColorScale = d3
		// 	.scaleLinear()
		// 	.domain([0, 1])
		// 	.range(["black", "white"]);

		// TODO:
	}
}
