import { matchSorter } from 'match-sorter'

export function fuzzyTextFilter( rows, id, filterValue ) {
  return matchSorter(rows, filterValue, {
    keys: [(row) => row.values[id]],
  })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilter.autoRemove = (val) => !val
