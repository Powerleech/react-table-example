import { TablePagination as _MuiTablePagination } from '@material-ui/core'
import React, { useCallback } from 'react'

const rowsPerPageOptions = [5, 10, 25, 50]

// avoid all of the redraws caused by the internal withStyles
const interestingPropsEqual = (prevProps, nextProps) =>
  prevProps.count === nextProps.count &&
  prevProps.rowsPerPage === nextProps.rowsPerPage &&
  prevProps.page === nextProps.page &&
  prevProps.onChangePage === nextProps.onChangePage &&
  prevProps.onChangeRowsPerPage === nextProps.onChangeRowsPerPage

// a bit of a type hack to keep OverridableComponent working as desired
const MuiTablePagination = React.memo(_MuiTablePagination, interestingPropsEqual)

export function TablePagination({ instance }) {
  const {
    state: { pageIndex, pageSize, rowCount = instance.rows.length },
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = instance

  const handleChangePage = useCallback(
    (event, newPage) => {
      if (newPage === pageIndex + 1) {
        nextPage()
      } else if (newPage === pageIndex - 1) {
        previousPage()
      } else {
        gotoPage(newPage)
      }
    },
    [gotoPage, nextPage, pageIndex, previousPage]
  )

  const onChangeRowsPerPage = useCallback(
    (e) => {
      setPageSize(Number(e.target.value))
    },
    [setPageSize]
  )

  return rowCount ? (
    <MuiTablePagination
      rowsPerPageOptions={rowsPerPageOptions}
      component='div'
      count={rowCount}
      rowsPerPage={pageSize}
      page={pageIndex}
      onChangePage={handleChangePage}
      onChangeRowsPerPage={onChangeRowsPerPage}
    />
  ) : null
}
