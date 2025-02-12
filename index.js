import { StarsPlacer } from "./starBattle/stars.js";
import { TentsGenerator } from "./tents/generate.js";
import { TentsSolver } from "./tents/solve.js";

// Tents
// const tents = new TentsGenerator();
// const [board, rowHints, colHints] = tents.generateUnique(6, true);

// Star Battle
const stars = new StarsPlacer(10, 2);
const starsPlacement = stars.generate();
