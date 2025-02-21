import { init } from "z3-solver";

/*
 * Finds a solution to a given star battle puzzle and also determines if the 
 * solution is unique.
 */
export class SBSolver {

    #z3Context;

    constructor() {}

    /*
     * [[1,2,2,3,3],
     *  [1,2,2,3,3],
     *  [2,2,2,2,5],
     *  [2,4,5,5,5],
     *  [4,4,5,5,5]]
     * 
     * Args
     * board: 2D array representing regions. cells belonging to the same region
     * should share the same value (see above for example)
     * N: number of stars expected in each region, row, and column
     */
    async solve(board, N) {
        await this.#init();

        const { Solver, Int, And, Or, Not } = this.#z3Context;

        const size = board.length;
        const cells = [];

        const solver = new Solver();

        // create a grid of z3 integers with condition that each must be 0 or 1
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const cellItem = Int.const(`(${i},${j})`);
                solver.add(Or(cellItem.eq(0), cellItem.eq(1)));
                row.push(cellItem);
            }
            cells.push(row);
        }

        // add condition that each row must have N stars
        for (let i = 0; i < size; i++) {
            let rowSum = cells[i][0];
            for (let j = 1; j < size; j++) {
                rowSum = rowSum.add(cells[i][j]);
            }
            solver.add(rowSum.eq(N))
        }

        // add condition that each column must have N stars
        for (let j = 0; j < size; j++) {
            let colSum = cells[0][j];
            for (let i = 1; i < size; i++) {
                colSum = colSum.add(cells[i][j]);
            }
            solver.add(colSum.eq(N));
        }

        // add condition that no two stars should be adjacent, even diagonally
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // orthogonals
                if (i-1 >= 0) solver.add(Or(cells[i][j].eq(0), cells[i-1][j].eq(0)));
                if (j-1 >= 0) solver.add(Or(cells[i][j].eq(0), cells[i][j-1].eq(0)));
                if (j+1 < size) solver.add(Or(cells[i][j].eq(0), cells[i][j+1].eq(0)));
                if (i+1 < size) solver.add(Or(cells[i][j].eq(0), cells[i+1][j].eq(0)));

                // diagonals
                if (i+1 < size && j+1 < size) solver.add(Or(cells[i][j].eq(0), cells[i+1][j+1].eq(0)));
                if (i+1 < size && j-1 >= 0) solver.add(Or(cells[i][j].eq(0), cells[i+1][j-1].eq(0)));
                if (i-1 >= 0 && j+1 < size) solver.add(Or(cells[i][j].eq(0), cells[i-1][j+1].eq(0)));
                if (i-1 >= 0 && j-1 >= 0) solver.add(Or(cells[i][j].eq(0), cells[i-1][j-1].eq(0)));
            }
        }

        // add condition that each region must have exactly N stars
        const regions = this.#processRegions(board);
        Object.keys(regions).forEach(id => {
            const coords = regions[id];

            // count the # of stars in each region (a star will be represented by z3 integer with value 1)
            let regionSum = cells[coords[0][0]][coords[0][1]];
            for (let i = 1; i < coords.length; i++) {
                const [x, y] = coords[i];
                regionSum = regionSum.add(cells[x][y]);
            }
            solver.add(regionSum.eq(N));
        });
        
        // if there is no solution, return null
        let sat = await solver.check();
        if (sat === "unsat") {
            return { soln: null };
        }

        // convert solution from array of z3 ints to a regular array of ints
        const model = solver.model();
        const firstSoln = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                row.push(parseInt(`${model.eval(cells[i][j])}`));
            }
            firstSoln.push(row);
        }

        // to see if another solution exists, add a condition preventing the first solution from being repeated
        let sameSoln = null;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const val = parseInt(`${model.eval(cells[i][j])}`);
                if (val === 1) {
                    if (sameSoln == null) sameSoln = cells[i][j].eq(1);
                    else sameSoln = And(sameSoln, cells[i][j].eq(1));
                }
            }
        }

        // try to find another solution
        solver.add(Not(sameSoln));
        sat = await solver.check();

        if (sat === "sat") {
            // uncomment to print alt solution for dev purposes
            // const secondSoln = [];
            // const model2 = solver.model();
            // for (let i = 0; i < size; i++) {
            //     const row = [];
            //     for (let j = 0; j < size; j++) {
            //         row.push(parseInt(`${model2.eval(cells[i][j])}`));
            //     }
            //     secondSoln.push(row);
            // }
    
            // return {soln: firstSoln, isUnique: false, alt: secondSoln};
    
            return {soln: firstSoln, isUnique: false}
        } else {
            return {soln: firstSoln, isUnique: true}
        }
    }

    #processRegions(board) {
        const obj = {}
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                const regionId = board[i][j];
                if (obj[regionId]) obj[regionId].push([i,j])
                else obj[regionId] = [[i,j]]
            }
        }
        return obj
    }

    async #init() {
        const { Context } = await init();
        this.#z3Context = new Context('sb');
    }
}