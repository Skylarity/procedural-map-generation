import {ProceduralMap} from "../src/index";
import {Biome} from "../src/interfaces/Biome";
import * as d3 from "d3";

describe("Procedurally generated map", () => {
	const proceduralMap = new ProceduralMap({
		elevationSeed: Math.random(),
		moistureSeed: Math.random()
	});
	proceduralMap.generateMap();

	test("fills with data", () => {
		expect(proceduralMap.elevationMap.length).toEqual(proceduralMap.size ** 2);
		expect(proceduralMap.moistureMap.length).toEqual(proceduralMap.size ** 2);
	});

	test("biomes have correct elevation", () => {
		proceduralMap.elevationMap.forEach((elevation: number, i: number) => {
			const moisture: number = proceduralMap.moistureMap[i];
			const biome: Biome = proceduralMap.getBiome(elevation, moisture);

			expect(biome.maxHeight).toBeGreaterThanOrEqual(elevation);
		});
	});

	test("biomes have correct moisture", () => {
		proceduralMap.moistureMap.forEach((moisture: number, i: number) => {
			const elevation: number = proceduralMap.elevationMap[i];
			const biome: Biome = proceduralMap.getBiome(elevation, moisture);

			expect(biome.moisture).toBeGreaterThanOrEqual(moisture);
		});
	});

	test("image generates with correct data", () => {
		const imageData: ImageData | null = proceduralMap.generateMapImage();
		expect(imageData).not.toBeNull();

		if (imageData !== null) {
			// Multiply by 4 to account for (r, g, b, a)
			expect(imageData.data.length).toEqual(proceduralMap.size ** 2 * 4);

			for (let i = 0; i < proceduralMap.size ** 2; ++i) {
				const elevation: number = proceduralMap.elevationMap[i];
				const moisture: number = proceduralMap.moistureMap[i];
				const biome: Biome = proceduralMap.getBiome(elevation, moisture);

				let r = imageData.data[i * 4];
				let g = imageData.data[i * 4 + 1];
				let b = imageData.data[i * 4 + 2];
				let a = imageData.data[i * 4 + 3];
				let imageDataColor: d3.RGBColor = d3.rgb(r, g, b, a);

				// Account for regular color and shadow color
				expect([
					biome.color.toString(),
					biome.color.darker(proceduralMap.shadowIntensity).toString()
				]).toContain(imageDataColor.toString());
			}
		}
	});
});
