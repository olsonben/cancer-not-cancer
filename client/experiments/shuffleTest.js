function rearrangeArrayForScenario1(arr, currentIndex, secondIndex) {
    if (secondIndex > currentIndex) {
        // Extract the element that needs to be moved
        const elementToMove = arr.splice(secondIndex, 1)[0];
        // Insert the extracted element at the current index
        arr.splice(currentIndex, 0, elementToMove);
    }
    return arr;
}

function rearrangeArrayForScenario2(arr, currentIndex, secondIndex) {
    if (secondIndex < currentIndex) {
        // Decrement current index
        currentIndex--;

        // Extract the element that needs to be moved
        const elementToMove = arr.splice(secondIndex, 1)[0];

        // Insert the extracted element at the new current index
        arr.splice(currentIndex, 0, elementToMove);
    }
    return arr;
}
let arr = [0, 1, 2, 3, 4, 5, 6];
let currentIndex = 3;
let secondIndex = 5;

// Scenario 1: Move element from position 5 to position 3
console.log("Before Scenario 1:", arr);
arr = rearrangeArrayForScenario1(arr, currentIndex, secondIndex);
console.log("After Scenario 1:", arr);

// Resetting array for the next example
arr = [0, 1, 2, 3, 4, 5, 6];
currentIndex = 3;
secondIndex = 1;

// Scenario 2: Move element from position 1 to position 3
console.log("Before Scenario 2:", arr);
arr = rearrangeArrayForScenario2(arr, currentIndex, secondIndex);
console.log("After Scenario 2:", arr);
