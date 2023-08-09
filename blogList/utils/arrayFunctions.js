const sortArray = (unsorted) => {
  if(unsorted.length <= 1) return unsorted;

  const firstHalf = sortArray(unsorted.slice(0, Math.floor(unsorted.length/2)));
  const secondHalf = sortArray(unsorted.slice(Math.floor(unsorted.length/2), unsorted.length));

  let sorted = [];
  let firstIndex = 0;
  let secondIndex = 0;

  while((firstIndex < firstHalf.length) || (secondIndex < secondHalf.length)) {
    if((firstIndex === firstHalf.length) ||
      (firstHalf[firstIndex] > secondHalf[secondIndex])) {
      sorted.push(secondHalf[secondIndex]);
      secondIndex++;
    } else {
      sorted.push(firstHalf[firstIndex]);
      firstIndex++;
    }
  }

  return sorted;
};

const reduceArray = (unreduced) => {
  if(unreduced.length <= 1) return unreduced;

  const reducedTail = reduceArray(unreduced.slice(1,unreduced.length));

  return unreduced[0] === unreduced[1] ?
    reducedTail :
    unreduced.slice(0,1).concat(reducedTail);
};

module.exports = {
  sortArray,
  reduceArray
};