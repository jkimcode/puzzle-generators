import { TentsGenerator } from "./tents/generate.js";
import { TentsSolver } from "./tents/solve.js";

const tents = new TentsGenerator();
const [board, rowHints, colHints] = tents.generateUnique(10, true);
