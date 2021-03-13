const regex = /([=<>!]*)\s*((?:[0-9].?[0-9]*)+)/

function parseValue(filterValue) {
  // eslint-disable-next-line eqeqeq
  const defaultComparator = (val) => val == filterValue
  const tokens = regex.exec(filterValue)
  if (!tokens) {
    return defaultComparator
  }
  switch (tokens[1]) {
    case '>':
      return (val) => parseFloat(val) > parseFloat(tokens[2])
    case '<':
      return (val) => parseFloat(val) < parseFloat(tokens[2])
    case '<=':
      return (val) => parseFloat(val) <= parseFloat(tokens[2])
    case '>=':
      return (val) => parseFloat(val) >= parseFloat(tokens[2])
    case '=':
      return (val) => parseFloat(val) === parseFloat(tokens[2])
    case '!':
      return (val) => parseFloat(val) !== parseFloat(tokens[2])
  }
  return defaultComparator
}

export function numericTextFilter(
  rows,
  id,
  filterValue
) {
  const comparator = parseValue(filterValue)
  return rows.filter((row) => comparator(row.values[id[0]]))
}

// Let the table remove the filter if the string is empty
numericTextFilter.autoRemove = (val) => !val
