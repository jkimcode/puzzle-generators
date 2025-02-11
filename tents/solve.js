export class TentsSolver {
    /*
     * Finds all solutions to given tent puzzle. Can be used independently
     * of the tentes generator.
     * 
     * Args
     * board: 2D array of tents puzzle, where 0 is empty cells and 1 is tree
     * rowHints: 1D array of row hints
     * colHints: 1D array of colhints
     */
    constructor(board, rowHints, colHints) {
        // create copy of board to be used by solver
        this.board = JSON.parse(JSON.stringify(board));

        this.rowHints = rowHints;
        this.colHints = colHints;

        // used by solver
        this.treeCoords = this.findTreeCoords();
        this.solutions = [];
    }

    // returns all solutions, where each solution is an array of coordinates of tent placements
    solve() {
        this.backtrack(0);

        return this.solutions;
    }

    backtrack(idx) {
        if (idx == this.treeCoords.length) {
            // solved. uncomment below to print board when a solution has been found.
            // console.log('solved')
            // this.printBoard();

            const shortened = this.getShortenedSolution();
            this.solutions.push(shortened);

            return;
        }

        const [row, col] = this.treeCoords[idx];

        const candidateTents = this.validTentPlacements(row, col);

        // try each tent placement 
        for (let i = 0; i < candidateTents.length; i++) {
            const [tentRow, tentCol] = candidateTents[i];

            this.board[tentRow][tentCol] = 2;
            this.backtrack(idx+1);
            this.board[tentRow][tentCol] = 0;
        }
        
    }

    // returns tent placements for tree at (row, col) that do not violate any constraints 
    validTentPlacements(row, col) {
        const placements = [];

        if (row - 1 >= 0 && this.validTentPlacement(row-1, col)) 
            placements.push([row-1,col]);            
        if (row + 1 < this.board.length && this.validTentPlacement(row+1, col)) 
            placements.push([row+1,col]);
        if (col - 1 >= 0 && this.validTentPlacement(row, col-1)) 
            placements.push([row,col-1]);
        if (col + 1 < this.board.length && this.validTentPlacement(row, col+1)) 
            placements.push([row,col+1]);

        return placements;
    }

    validTentPlacement(row, col) {
        return this.board[row][col] == 0 && !this.hasAdjacentTent(row, col) && !this.isRowOrColumnFull(row, col);
    }

    // returns true if either row or column at (row, col) already meets total # of tents specified by hints
    isRowOrColumnFull(row, col) {
        // check row
        let rowTentsCount = 0;
        for (let j = 0; j < this.board[0].length; j++) {
            if (this.board[row][j] == 2) rowTentsCount++;
        }
        if (rowTentsCount == this.rowHints[row]) return true;

        // check col
        let colTentsCount = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i][col] == 2) colTentsCount++;
        }
        if (colTentsCount == this.colHints[col]) return true; 

        return false;
    }

    // returns true if (row, col) is adjacent to at least one tent (including diagonally)
    hasAdjacentTent(row, col) {
        // orthogonal
        if (row - 1 >= 0 && this.board[row-1][col] == 2) return true;
        if (row + 1 < this.board.length && this.board[row+1][col] == 2) return true;
        if (col - 1 >= 0 && this.board[row][col-1] == 2) return true;
        if (col + 1 < this.board[0].length && this.board[row][col+1] == 2) return true;

        // diagonal
        if (row - 1 >= 0 && col - 1 >= 0 && this.board[row-1][col-1] == 2) return true;
        if (row + 1 < this.board.length && col + 1 < this.board[0].length && this.board[row+1][col+1] == 2) return true;
        if (col - 1 >= 0 && row + 1 < this.board.length && this.board[row+1][col-1] == 2) return true;
        if (col + 1 < this.board[0].length && row-1 >= 0 && this.board[row-1][col+1] == 2) return true;

        return false;
    }

    findTreeCoords() {
        const result = [];

        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {
                if (this.board[i][j] == 1) {
                    result.push([i,j]);
                }
            }
        }

        return result;
    }

    // returns array of current tent placements (used when solution is found)
    getShortenedSolution() {
        const tents = [];
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {
                if (this.board[i][j] == 2) tents.push([i,j]);
            }
        }
        return tents;
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