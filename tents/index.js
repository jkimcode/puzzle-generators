import { TentsGenerator } from "./generate";

// example usage
const tents = new TentsGenerator();
const [board, rowHints, colHints] = tents.generateUnique(6, true);