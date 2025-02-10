import { randIntBtw } from "../utils/utils";

export class TentsGenerator {
    constructor(size) {
        this.size = size;
        this.board = emptyBoard();
    }

    generate(size) {
        
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
}

