import { randIntBtw, randomPick } from "../utils/utils.js";
import { TentsSolver } from "./solve.js";

export class TentsGenerator {
    constructor() {
        this.size = -1;
        this.board = [];

        this.presets = [
            { size: 10, numTrees: 22, clusterMaxSize: 3},
            { size: 6, numTrees: 8, clusterMaxSize: 2}
        ];
    }

    generateUnique(size, includeSolution) {
        // check if size is supported
        const preset = this.presets.find(item => item.size == size);
        if (preset == undefined) {
            console.log('that size is not supported yet');
            return [null, null, null];
        }

        // initialize
        this.size = preset.size;
        this.board = this.emptyBoard();

        this.generate();

        // if failed to generate initial board, return
        if (!this.board) {
            console.log('failed to generate initial board')
            return [null, null, null];
        }

        // check if board's solution is unique
        const hints = this.generateHints();
        const treesOnly = this.getTreesOnlyBoard();

        const solver = new TentsSolver(treesOnly, hints[0], hints[1]);
        const solutions = solver.solve();

        if (solutions.length == 1) {
            console.log('generated board with unique solution');
            this.printBoard();
            return [includeSolution ? this.board : treesOnly, hints[0], hints[1]];
        } else {
            console.log('solution to generated board not unique. try again.')
            return [null, null, null];
        }
    }

    // generates complete board with tree placements and their matching tents. does
    // not guarantee solution is unique.
    generate() {
        // hardcoded values for puzzle sizes
        let numTrees = -1;
        let clusterMaxSize = -1;
        if (this.size == 6) {
            numTrees = 8;
            clusterMaxSize = 2;
        } else if (this.size == 10) {
            numTrees = 22;
            clusterMaxSize = 3;
        } else {
            console.log('size not supported');
            return;
        }

        let treesPlaced = 0;
        let NUM_RETRY_ATTEMPTS = 10000;
        
        outer_loop:
        while (treesPlaced < numTrees) {
            // if attempts have run out, the generated board until this point probably does not yield
            // additional tree or tent placements. set board to null and exit
            if (NUM_RETRY_ATTEMPTS == 0) {
                this.board = null;
                return;
            }

            // determine cluster size 
            const clusterSize = Math.min(
                randIntBtw(1, clusterMaxSize),
                numTrees - treesPlaced
            );
            
            // keep track of coordinates to potentially place trees
            let availableCells = [];

            // find starting point for cluster
            availableCells.push(this.randomEmtpyCell());

            // attempt to place a cluster
            for (let i = 0; i < clusterSize; i++) {
                // if failed to place all clusterSize number of trees, just 
                // move on to next cluster  (more efficient this way)
                if (availableCells.length == 0) {
                    NUM_RETRY_ATTEMPTS -= 1;

                    continue outer_loop;
                }

                // place the tree (tentative until its adjacent tent is verified)
                const [tree_row, tree_col] = availableCells.shift();
                this.board[tree_row][tree_col] = 1;

                const tentCoords = this.tentPlacements(tree_row, tree_col);
                if (tentCoords == null) {
                    NUM_RETRY_ATTEMPTS -= 1;

                    // unset tree since there can be no valid tent for it
                    this.board[tree_row][tree_col] = 0;
                    continue outer_loop;
                }

                // tent can now be placed
                const [tent_row, tent_col] = tentCoords;
                this.board[tent_row][tent_col] = 2;

                // increment treesPlaced after both three and tent are placed
                treesPlaced += 1;

                // add empty neighbors as available cells
                const available = this.neighborsOfType(tree_row, tree_col, 0);
                availableCells = availableCells.concat(available);
            }
        }

        // uncomment to print generated board
        // this.printBoard();
    }

    // returns all neighbors (including diagonals) of a type
    neighborsOfType(row, col, type) {
        const result = [];

        // adjacents
        if (row - 1 >= 0 && this.board[row-1][col] == type)
            result.push([row-1,col]);
        if (row + 1 < this.board.length && this.board[row+1][col] == type)
            result.push([row+1,col]);
        if (col - 1 >= 0 && this.board[row][col-1] == type)
            result.push([row,col-1]);
        if (col + 1 < this.board[0].length && this.board[row][col+1] == type)
            result.push([row,col+1]);

        // diagonals
        if (row - 1 >= 0 && col - 1 >= 0 && this.board[row-1][col-1] == type)
            result.push([row-1,col-1]);
        if (row + 1 < this.board.length && col + 1 < this.board[0].length && this.board[row+1][col+1] == type)
            result.push([row+1,col+1]);
        if (col - 1 >= 0 && row + 1 < this.board.length && this.board[row+1][col-1] == type)
            result.push([row+1,col-1]);
        if (col + 1 < this.board[0].length && row-1 >= 0 && this.board[row-1][col+1] == type)
            result.push([row-1,col+1]);

        return result;
    }

    // returns a random, valid tent placement for tree at (row, col)
    tentPlacements(row, col) {
        const candidates = [];

        if (row - 1 >= 0 && this.board[row-1][col] == 0 && this.neighborsOfType(row-1, col, 2).length === 0)
            candidates.push([row-1,col]);
        if (row + 1 < this.board.length && this.board[row+1][col] == 0 && this.neighborsOfType(row+1, col, 2).length === 0)
            candidates.push([row+1,col]);
        if (col - 1 >= 0 && this.board[row][col-1] == 0 && this.neighborsOfType(row, col-1, 2).length === 0) 
            candidates.push([row,col-1]);
        if (col + 1 < this.board[0].length && this.board[row][col+1] == 0 && this.neighborsOfType(row, col+1, 2).length === 0)
            candidates.push([row,col+1]);

        if (candidates.length == 0) return null;
        return randomPick(candidates);
    }

    randomEmtpyCell() {
        const emptyCells = [];
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {
                if (this.board[i][j] == 0) {
                    emptyCells.push([i,j]);
                }
            }
        }
    
        return randomPick(emptyCells);
    }

    emptyBoard() {
        const board = [];
        for (let i = 0; i < this.size; i++) {
            const row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(0);
            }
            board.push(row);
        }
        return board;
    }

    generateHints() {
        const rowHints = [];
        for (let i = 0; i < this.board.length; i++) {
            let rowTentsCount = 0;
            for (let j = 0; j < this.board[0].length; j++) {
                if (this.board[i][j] == 2) rowTentsCount++;
            }
            rowHints.push(rowTentsCount);
        }

        const colHints = [];
        for (let j = 0; j < this.board[0].length; j++) {
            let colTentsCount = 0;
            for (let i = 0; i < this.board.length; i++) {
                if (this.board[i][j] == 2) colTentsCount++;
            }
            colHints.push(colTentsCount);
        }

        return [rowHints, colHints];
    }

    // returns copy of current board where tents have been cleared out
    getTreesOnlyBoard() {
        const result = [];
        for (let i = 0; i < this.board.length; i++) {
            const row = [];
            for (let j = 0; j < this.board[0].length; j++) {
                if (this.board[i][j] == 1) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            result.push(row);
        }
        return result;
    }

    printBoard() {
        let boardStr = "";
        for (let i = 0; i < this.board.length; i++) {
            let rowStr = "";
            for (let j = 0; j < this.board[0].length; j++) {
                rowStr = rowStr.concat(`${this.board[i][j]}`);
            }
            rowStr = rowStr.concat("\n");
            boardStr = boardStr.concat(rowStr);
        }
        console.log(boardStr);
    }
}

