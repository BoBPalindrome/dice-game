// Utility functions will go here
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateDiceCombinations() {
    const combinations = {};
    
    // Initialize counts for all possible sums (2 to 12)
    for (let i = 2; i <= 12; i++) {
        combinations[i] = 0;
    }
    
    // Count all possible combinations
    for (let die1 = 1; die1 <= 6; die1++) {
        for (let die2 = 1; die2 <= 6; die2++) {
            combinations[die1 + die2]++;
        }
    }
    
    return combinations;
}

// Calculate and log the combinations
const combinations = calculateDiceCombinations();
console.log('Number of combinations for each sum:');
for (let sum = 2; sum <= 12; sum++) {
    console.log(`Sum of ${sum}: ${combinations[sum]} combinations`);
} 