import {ProceduralMap} from "../src/index";

test("Map fills with data", () => {
	const proceduralMap = new ProceduralMap({
		elevationSeed: Math.random(),
		moistureSeed: Math.random()
	});
	proceduralMap.generateMap();

	expect(proceduralMap.elevationMap.length).toEqual(proceduralMap.size ** 2);
	expect(proceduralMap.moistureMap.length).toEqual(proceduralMap.size ** 2);
});
