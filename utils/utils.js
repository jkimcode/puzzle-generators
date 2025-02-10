export function randomPick(arr) {
    return arr[Math.floor(arr.length * Math.random())]
}

export function randomIdx(arr) {
    return Math.floor(arr.length * Math.random())
}

export function randIntBtw(lo, hi) {
    // inclusive
    return Math.floor(Math.random() * (hi - lo + 1)) + lo
}