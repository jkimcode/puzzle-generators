export function randomPick(arr) {
    if (arr.length == 0) return undefined;
    return arr[Math.floor(arr.length * Math.random())]
}

export function randomIdx(arr) {
    if (arr.length == 0) return undefined;
    return Math.floor(arr.length * Math.random())
}

export function randIntBtw(lo, hi) {
    // inclusive
    return Math.floor(Math.random() * (hi - lo + 1)) + lo
}