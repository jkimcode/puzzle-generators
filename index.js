import { TentsGenerator } from "./tents/generate.js";
import { TentsSolver } from "./tents/solve.js";

const tents = new TentsGenerator();
const [board, rowHints, colHints] = tents.generate10by10();
if (board) {
    tents.printBoard();

    // console.log(rowHints);
    // console.log(colHints);

    // test-only. for now, manually erase solution from generated board
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] == 2) board[i][j] = 0;
        }
    }
    const solver = new TentsSolver(board, rowHints, colHints);
    solver.solve();
}
