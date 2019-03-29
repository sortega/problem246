function isAwesome(triplet) {
    return triplet.every((n, index, array) => (index === 0) || (array[index - 1] < n))
} 
 
export default isAwesome;