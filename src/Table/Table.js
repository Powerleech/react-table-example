import { TableSortLabel, TextField } from '@material-ui/core'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp'
import cx from 'classnames'
import React, { useEffect } from 'react'
import {
  useColumnOrder,
  useExpanded,
  useFilters,
  useFlexLayout,
  useGroupBy,
  usePagination,
  useResizeColumns,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table'

import { useDebounce, useLocalStorage } from '../utils'
import { FilterChipBar } from './FilterChipBar'
import { fuzzyTextFilter, numericTextFilter } from './filters'
import { ResizeHandle } from './ResizeHandle'
import { TableDebug } from './TableDebug'
import { TablePagination } from './TablePagination'
import { HeaderCheckbox, RowCheckbox, useStyles } from './TableStyles'
import { TableToolbar } from './TableToolbar'
import { TooltipCell } from './TooltipCell'

// yes this is recursive, but the depth never exceeds three so it seems safe enough
const findFirstColumn = (columns) =>
  columns[0].columns ? findFirstColumn(columns[0].columns) : columns[0]

function DefaultColumnFilter({ columns, column }) {
  const { id, filterValue, setFilter, render } = column
  const [value, setValue] = React.useState(filterValue || '')
  const handleChange = (event) => {
    setValue(event.target.value)
  }
  // ensure that reset loads the new value
  useEffect(() => {
    setValue(filterValue || '')
  }, [filterValue])

  const isFirstColumn = findFirstColumn(columns) === column
  return (
    <TextField
      name={id}
      label={render('Header')}
      InputLabelProps={{ htmlFor: id }}
      value={value}
      autoFocus={isFirstColumn}
      variant={'standard'}
      onChange={handleChange}
      onBlur={(e) => {
        setFilter(e.target.value || undefined)
      }}
    />
  )
}

const getStyles = (props, disableResizing = false, align = 'left') => [
  props,
  {
    style: {
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      alignItems: 'flex-start',
      display: 'flex',
    },
  },
]

const selectionHook = (hooks) => {
  hooks.allColumns.push((columns) => [
    // Let's make a column for selection
    {
      id: '_selector',
      disableResizing: true,
      disableGroupBy: true,
      minWidth: 45,
      width: 45,
      maxWidth: 45,
      // The header can use the table's getToggleAllRowsSelectedProps method
      // to render a checkbox
      Header: ({ getToggleAllRowsSelectedProps }) => (
        <HeaderCheckbox {...getToggleAllRowsSelectedProps()} />
      ),
      // The cell can use the individual row's getToggleRowSelectedProps method
      // to the render a checkbox
      Cell: ({ row }) => <RowCheckbox {...row.getToggleRowSelectedProps()} />,
    },
    ...columns,
  ])
  hooks.useInstanceBeforeDimensions.push(({ headerGroups }) => {
    // fix the parent group of the selection button to not be resizable
    const selectionGroupHeader = headerGroups[0].headers[0]
    selectionGroupHeader.canResize = false
  })
}

const headerProps = (props, { column }) =>
  getStyles(props, column && column.disableResizing, column && column.align)

const cellProps = (props, { cell }) =>
  getStyles(props, cell.column && cell.column.disableResizing, cell.column && cell.column.align)

const defaultColumn = {
  Filter: DefaultColumnFilter,
  Cell: TooltipCell,
  // When using the useFlexLayout:
  minWidth: 30, // minWidth is only used as a limit for resizing
  width: 150, // width is used for both the flex-basis and flex-grow
  maxWidth: 200, // maxWidth is only used as a limit for resizing
}

const hooks = [
  useColumnOrder,
  useFilters,
  useGroupBy,
  useSortBy,
  useExpanded,
  useFlexLayout,
  usePagination,
  useResizeColumns,
  useRowSelect,
  selectionHook,
]

const filterTypes = {
  fuzzyText: fuzzyTextFilter,
  numeric: numericTextFilter,
}

export function Table(props) {
  const { name, columns, onAdd, onDelete, onEdit, onClick } = props
  const classes = useStyles()

  const [initialState, setInitialState] = useLocalStorage(`tableState:${name}`, {})
  const instance = useTable(
    {
      ...props,
      columns,
      filterTypes,
      defaultColumn,
      initialState,
    },
    ...hooks
  )

  const { getTableProps, headerGroups, getTableBodyProps, page, prepareRow, state } = instance
  const debouncedState = useDebounce(state, 500)

  useEffect(() => {
    const { sortBy, filters, pageSize, columnResizing, hiddenColumns } = debouncedState
    const val = {
      sortBy,
      filters,
      pageSize,
      columnResizing,
      hiddenColumns,
    }
    setInitialState(val)
  }, [setInitialState, debouncedState])

  const cellClickHandler = (cell) => () => {
    onClick && cell.column.id !== '_selector' && onClick(cell.row)
    console.log(cell);
  }

  return (
    <div>
      <TableToolbar instance={instance} {...{ onAdd, onDelete, onEdit }} />
      <FilterChipBar instance={instance} />
      <div className={classes.tableTable} {...getTableProps()}>
        <div>
          {headerGroups.map((headerGroup) => (
            <div {...headerGroup.getHeaderGroupProps()} className={classes.tableHeadRow}>
              {headerGroup.headers.map((column) => {
                const style = {
                  textAlign: column.align ? column.align : 'left ',
                }
                return (
                  <div {...column.getHeaderProps(headerProps)} className={classes.tableHeadCell}>
                    {column.canSort ? (
                      <TableSortLabel
                        active={column.isSorted}
                        direction={column.isSortedDesc ? 'desc' : 'asc'}
                        {...column.getSortByToggleProps()}
                        className={classes.tableSortLabel}
                        style={style}
                      >
                        {column.render('Header')}
                      </TableSortLabel>
                    ) : (
                      <div style={style} className={classes.tableLabel}>
                        {column.render('Header')}
                      </div>
                    )}
                    {column.canResize && <ResizeHandle column={column} />}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()} className={classes.tableBody}>
          {page.map((row) => {
            prepareRow(row)
            return (
              <div
                {...row.getRowProps()}
                className={cx(classes.tableRow, {
                  rowSelected: row.isSelected,
                })}
              >
                {row.cells.map((cell) => (
                  <div {...cell.getCellProps(cellProps)} onClick={cellClickHandler(cell)} className={classes.tableCell}>
                    {cell.isGrouped ? (
                      <>
                        <TableSortLabel
                          classes={{
                            iconDirectionAsc: classes.iconDirectionAsc,
                            iconDirectionDesc: classes.iconDirectionDesc,
                          }}
                          active
                          direction={row.isExpanded ? 'desc' : 'asc'}
                          IconComponent={KeyboardArrowUp}
                          {...row.getToggleRowExpandedProps()}
                          className={classes.cellIcon}
                        />{' '}
                        {cell.render('Cell')} ({row.subRows.length})
                      </>
                    ) : cell.isAggregated ? (
                      cell.render('Aggregated')
                    ) : cell.isPlaceholder ? null : (
                      cell.render('Cell')
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      <TablePagination instance={instance} />
      <TableDebug enabled instance={instance} />
    </div>
  )
}
