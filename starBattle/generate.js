import { print2DArrayAsGrid, randomPick, shuffle } from "../utils/utils.js";
import { SBSolver } from "./solve.js";
import { StarsPlacer } from "./stars.js";

/*
 * Attempts to generate star battle puzzle with unique solution (currently unable to
 * generate board with unique solution 100% of the time)
 * 
 * TODO: increase success rate 
 */
export class SBGenerator {

    #size = 0;
    #N = 0;

    #board = [];
    #solution = [];

    constructor() {
        this.presets = [
            { size: 10, N: 2, minRegionArea: 3 },
            { size: 6, N: 1, minRegionArea: 2 },
            { size: 5, N: 1, minRegionArea: 2 }
        ];
    }

    async generateUnique(size, N) {
        // check if combination of size and N is supported
        const preset = this.presets.find(item => item.size == size && item.N == N);
        if (preset == undefined) {
            console.log('that combination of size and N is not supported');
            return;
        }

        // generate the solution first. it will be a 2D grid with all the stars placed
        const stars = new StarsPlacer(size, N);
        this.#solution = stars.generate();

        // initialize board to generate regions on
        this.#size = size; 
        this.#N = N;
        this.#initBoard();

        // generate regions around stars
        while (true) {
            this.#initBoard();
            if (this.#generate()) break;
        }
        
        const solver = new SBSolver();
        const solveResult = await solver.solve(this.#board, this.#N);

        if (!solveResult.soln) {
            console.log('could not find solution');
        } else {
            if (solveResult.isUnique) console.log('generated unique board');
            else console.log('board does not have unique solution');
        }
    }

    // generates regions around stars. does not guarantee regions lead to unique solution
    #generate() {
        for (let i = 0; i < this.#size; i++) {
            // find starting point
            let [row, col] = this.#randomUnassignedCell();

            // try to fill a region of N stars
            let numAttempts = 10;
            let isRegionFound = false;
            while (numAttempts > 0) {
                if (this.#growRegion(row, col, i+1)) {
                    isRegionFound = true;
                    break;
                }

                // find a different starting point
                const coords = this.#randomUnassignedCell();

                row = coords[0];
                col = coords[1];
                numAttempts--;
            }
            
            if (!isRegionFound) return false;
        }

        // assign region to any remaining cells
        this.#assignRemainingCells();

        return true;
    }

    #growRegion(starRow, startCol, regionId) {
        const minArea = 
            this.presets.find(item => item.size == this.#size && item.N == this.#N).minRegionArea;

        const queue = [[starRow, startCol]];
        const alreadyAssigned = []; // array of cells to reset in case growRegion fails
        let area = 0;
        let stars = 0;
        while (area < minArea || stars < this.#N) {
            if (queue.length == 0) {
                // reset
                alreadyAssigned.forEach(item => {
                    this.#board[item[0]][item[1]] = 0;
                });

                // if queue is empty, all paths starting at input (starRow, startCol) have been tried
                return false;
            }

            // load next cell 
            const [row, col] = queue.shift();

            // if it has region, ignore
            if (this.#board[row][col] != 0) continue;

            // assign region to cell
            this.#board[row][col] = regionId;
            alreadyAssigned.push([row,col]);
            area++;

            // check if cell is a star
            if (this.#solution[row][col] == 1) {
                stars++;
            }

            // add orthogonal neighbors to queue
            if (col - 1 >= 0) queue.push([row, col-1]);
            if (col + 1 < this.#size) queue.push([row, col+1]);
            if (row - 1 >= 0) queue.push([row-1, col]);
            if (row + 1 < this.#size) queue.push([row+1, col]);

            // shuffle queue
            shuffle(queue);
        }

        return true;
    }

    #assignRemainingCells() {
        const queue = [];
        for (let i = 0; i < this.#size; i++) {
            for (let j = 0; j < this.#size; j++) {
                if (this.#board[i][j] == 0) queue.push([i,j]);
            }
        }

        while (queue.length > 0) {
            const [row, col] = queue.shift();
            const neighborRegions = this.#getNeighborRegions(row, col);

            // if cell doesn't have neighboring regions yet, add it back to queue
            if (neighborRegions.length == 0) {
                queue.push([row, col]);
                continue;
            }

            this.#board[row][col] = randomPick(neighborRegions);
        }
    }

    #getNeighborRegions(row, col) {
        const result = [];
        if (col - 1 >= 0 && this.#board[row][col-1] != 0) 
            result.push(this.#board[row][col-1]);
        if (col + 1 < this.#size && this.#board[row][col+1] != 0) 
            result.push(this.#board[row][col+1]);
        if (row - 1 >= 0 && this.#board[row-1][col] != 0) 
            result.push(this.#board[row-1][col]);
        if (row + 1 < this.#size && this.#board[row+1][col] != 0) 
            result.push(this.#board[row+1][col]);

        // remove duplicates
        const filtered = result.filter((item, idx) => idx == result.indexOf(item));
        return filtered;
    }

    #randomUnassignedCell() {
        const unassignedCells = [];
        for (let i = 0; i < this.#size; i++) {
            for (let j = 0; j < this.#size; j++) {
                if (this.#board[i][j] == 0) unassignedCells.push([i,j]);
            }
        }
        return randomPick(unassignedCells);
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

    // for debugging purposes
    #printBoard(soln) {
        let boardStr = "";
        for (let i = 0; i < this.#size; i++) {
            let rowStr = "";
            let rowBorderStr = "";
            for (let j = 0; j < this.#size; j++) {
                if (j == 0) {
                    rowStr += "|";
                    rowBorderStr += " ";
                } 
                
                if (j < this.#size-1) {
                    if (this.#board[i][j] != this.#board[i][j+1]) {
                        if (soln[i][j] == 1) rowStr += " *|";
                        else rowStr += "  |";
                    } else {
                        if (soln[i][j] == 1) rowStr += " * ";
                        else rowStr += "   ";
                    }
                } else {
                    if (soln[i][j] == 1) rowStr += " *|";
                    else rowStr += "  |";
                }

                if (i < this.#size-1) {
                    if (this.#board[i][j] != this.#board[i+1][j]) {
                        rowBorderStr += "---";
                    } else {
                        rowBorderStr += "   ";
                    }
                } else {
                    rowBorderStr += "---";
                }
            }
            rowStr += "\n";
            rowBorderStr += "\n";
            boardStr += rowStr;
            boardStr += rowBorderStr;
        }
        console.log(boardStr);
    }
}