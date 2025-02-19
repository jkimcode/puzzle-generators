import { SBGenerator } from "./starBattle/generate.js";
import { StarsPlacer } from "./starBattle/stars.js";
import { TentsGenerator } from "./tents/generate.js";
import { TentsSolver } from "./tents/solve.js";
import { print2DArrayAsGrid } from "./utils/utils.js";

// Tents
// const tents = new TentsGenerator();
// const [board, rowHints, colHints] = tents.generateUnique(6, true);

// Star Battle
// const stars = new StarsPlacer(10, 2);
// const starsPlacement = stars.generate();
// print2DArrayAsGrid(starsPlacement);

const starBattle = new SBGenerator();
starBattle.generateUnique(10, 2);
