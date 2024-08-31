/**
 * Helper - Durstenfeld Shuffle
 * https://stackoverflow.com/a/12646864/3068136
 */
export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

/**
 * deepEqual - check if two objects have the same data
 * https://stackoverflow.com/a/25456134/3068136
 */
export const deepEqual = (a, b) => {
    if (a === b)
        return true

    if ((typeof a == "object" && a != null) && (typeof b == "object" && b != null)) {
        if (Object.keys(a).length != Object.keys(b).length)
            return false

        for (var prop in a) {
            if (b.hasOwnProperty(prop)) {
                if (!deepEqual(a[prop], b[prop]))
                    return false
            } else {
                return false
            }
        }

        return true
    } else {
        return false
    }
}