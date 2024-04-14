function range(start, end) {
    // Create an array to hold the range of numbers
    const rangeArray = [];
    
    // Loop from the start number to the end number (inclusive)
    for (let i = start; i <= end; i++) {
        // Add each number to the range array
        rangeArray.push(i);
    }
    
    // Return the array of numbers
    return rangeArray;
}
