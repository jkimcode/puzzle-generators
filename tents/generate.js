import { randIntBtw, randomPick } from "../utils/utils.js";

export class TentsGenerator {
    constructor() {
        this.size = -1;
        this.board = [];
    }

    generate10by10() {
        // initialize
        this.size = 10;
        this.board = this.emptyBoard();

        this.generate(10);
    }

    generate6by6() {
        // initialize
        this.size = 6;
        this.board = this.emptyBoard();

        this.generate(6);
    }

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
        
        outer_loop:
        while (treesPlaced < numTrees) {
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
                    continue outer_loop;
                }

                // place the tree (tentative until its adjacent tent is verified)
                const [tree_row, tree_col] = availableCells.shift();
                this.board[tree_row][tree_col] = 1;

                const tentCoords = this.tentPlacements(tree_row, tree_col);
                if (tentCoords == null) {
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

        this.printBoard();
        return this.board;
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

