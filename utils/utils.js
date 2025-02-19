export function randomPick(arr) {
    if (arr.length == 0) return undefined;
    return arr[Math.floor(arr.length * Math.random())];
}

export function randomIdx(arr) {
    if (arr.length == 0) return undefined;
    return Math.floor(arr.length * Math.random());
}

export function randIntBtw(lo, hi) {
    // inclusive
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

// shuffles array in-place
export function shuffle(arr) {
    for (let i = 0; i < arr.length; i++) {
        const swapIdx = randomIdx(arr);
        const saved = arr[i];
        arr[i] = arr[swapIdx];
        arr[swapIdx] = saved;
    }
}

// returns duplicate of 2D array containing only primitives
export function clone2DArray(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const row = [];
        for (let j = 0; j < arr[0].length; j++) {
            row.push(arr[i][j]);
        }
        result.push(row);
    }
    return result;
}

export function print2DArrayAsGrid(arr) {
    let boardStr = "";
    for (let i = 0; i < arr.length; i++) {
        let rowStr = "";
        for (let j = 0; j < arr[0].length; j++) {
            rowStr = rowStr.concat(`${arr[i][j]}`);
        }
        rowStr = rowStr.concat("\n");
        boardStr = boardStr.concat(rowStr);
    }
    console.log(boardStr);
}