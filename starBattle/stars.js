import { clone2DArray, shuffle } from "../utils/utils.js";

export class StarsPlacer {

    #board = [];
    #size = 0;
    #N = 0;

    #solution = null;

    /*
     * Finds a random, valid placement of N stars in size x size 
     * board. No consideration of regions. 
     */
    constructor(size, N) {
        this.#size = size;
        this.#N = N;
    }

    // if shorten=false, full grid array is returned. otherwise, only 
    // the star coordinates of solution are returned.
    generate(shorten=false) {
        // reset board
        this.#initBoard();

        this.#backtrack(0);

        if (shorten) return this.#solutionCoordinates();
        else return this.#solution;
    }

    #backtrack(row) {
        if (row == this.#size) {
            // if solved, record the solution
            this.#solution = clone2DArray(this.#board);

            return true;
        }

        // if placed N stars for current row, move to next row
        if (this.#numRowStars(row) == this.#N && this.#backtrack(row+1)) {
            return true;
        }

        // get valid coordinates to place star inside current row
        const candidates = this.#validInRow(row);

        // randomize 
        shuffle(candidates);

        // try each candidate star placement and backtrack
        for (let i = 0; i < candidates.length; i++) {
            const [candRow, candCol] = candidates[i];

            this.#board[candRow][candCol] = 1;

            if (this.#backtrack(row)) return true;

            this.#board[candRow][candCol] = 0;
        }

        return false;
    }

    // returns valid star placements in given row 
    #validInRow(row) {
        const result = [];
        for (let j = 0; j < this.#board[0].length; j++) {
            if (this.#board[row][j] == 0 && !this.#hasAdjacentStar(row,j) && this.#numColStars(j) < this.#N) {
                result.push([row, j]);
            }
        }
        return result;
    }

    // returns true if (row, col) is adjacent to a star
    #hasAdjacentStar(row, col) {
        const size = this.#size;
        const board = this.#board;

        // orthogonal
        if (row-1 >= 0 && board[row-1][col] == 1) return true;
        if (row+1 < size && board[row+1][col] == 1) return true; 
        if (col-1 >= 0 && board[row][col-1] == 1) return true; 
        if (col+1 < size && board[row][col+1] == 1) return true; 

        // diagonal
        if (row-1 >= 0 && col-1 >= 0 && board[row-1][col-1] == 1) return true; 
        if (row-1 >= 0 && col+1 < size && board[row-1][col+1] == 1) return true;
        if (row+1 < size && col-1 >= 0 && board[row+1][col-1] == 1) return true;
        if (row+1 < size && col+1 < size && board[row+1][col+1] == 1) return true; 

        return false;
    }

    #numColStars(col) {
        let num = 0;
        for (let i = 0; i < this.#size; i++) {
            if (this.#board[i][col] == 1) num++;
        }
        return num;
    }

    #numRowStars(row) {
        let num = 0;
        for (let j = 0; j < this.#size; j++) {
            if (this.#board[row][j] == 1) num++;
        }
        return num;
    }

    #solutionCoordinates() {
        const result = [];
        for (let i = 0; i < this.#size; i++) {
            for (let j = 0; j < this.#size; j++) {
                if (this.#solution[i][j] == 1) 
                    result.push([i,j]);
            }
        }
        return result;
    }

    #initBoard() {
        const board = [];
        for (let i = 0; i < this.#size; i++) {
            const row = [];
            for (let j = 0; j < this.#size; j++) {
                row.push(0);
            }
            board.push(row);
        }
        this.#board = board;
    }
}