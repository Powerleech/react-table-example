// Various functions pulled from the internal react-table utils package - useful
// when pulling hooks from the main repo before changing them.

export function sum(arr) {
  return arr.reduce((prev, curr) => prev + curr, 0)
}

export function getFirstDefined(...args) {
  for (let i = 0; i < args.length; i += 1) {
    if (typeof args[i] !== 'undefined') {
      return args[i]
    }
  }
}
