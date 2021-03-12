import { Button, IconButton, Theme, Toolbar, Tooltip, createStyles, makeStyles } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/CreateOutlined'
import DeleteIcon from '@material-ui/icons/DeleteOutline'
import FilterListIcon from '@material-ui/icons/FilterList'
import ViewColumnsIcon from '@material-ui/icons/ViewColumn'
import classnames from 'classnames'
import React, { useCallback, useState } from 'react'


import { ColumnHidePage } from './ColumnHidePage'
import { FilterPage } from './FilterPage'

export const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    leftButtons: {},
    rightButtons: {},
    leftIcons: {
      '&:first-of-type': {
        marginLeft: -12,
      },
    },
    rightIcons: {
      padding: 12,
      marginTop: '-6px',
      width: 48,
      height: 48,
      '&:last-of-type': {
        marginRight: -12,
      },
    },
  })
)

export const InstanceLabeledActionButton = ({
  instance,
  icon,
  onClick,
  label,
  enabled = () => true,
}) => (
  <Button variant='contained' color='primary' onClick={onClick(instance)} disabled={!enabled(instance)}>
    {icon}
    {label}
  </Button>
)

export const LabeledActionButton = ({ icon, onClick, label, enabled = true }) => (
  <Button variant='contained' color='primary' onClick={onClick} disabled={!enabled}>
    {icon}
    {label}
  </Button>
)

export const InstanceSmallIconActionButton = ({
  instance,
  icon,
  onClick,
  label,
  enabled = () => true,
  variant,
}) => {
  const classes = useStyles({})
  return (
    <Tooltip title={label} aria-label={label}>
      <span>
        <IconButton
          className={classnames({
            [classes.rightIcons]: variant === 'right',
            [classes.leftIcons]: variant === 'left',
          })}
          onClick={onClick(instance)}
          disabled={!enabled(instance)}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  )
}

export const SmallIconActionButton = ({
  icon,
  onClick,
  label,
  enabled = true,
  variant,
}) => {
  const classes = useStyles({})
  return (
    <Tooltip title={label} aria-label={label}>
      <span>
        <IconButton
          className={classnames({
            [classes.rightIcons]: variant === 'right',
            [classes.leftIcons]: variant === 'left',
          })}
          onClick={onClick}
          disabled={!enabled}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  )
}

export function TableToolbar({
  instance,
  onAdd,
  onDelete,
  onEdit,
}){
  const { columns } = instance
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(undefined)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const hideableColumns = columns.filter((column) => !(column.id === '_selector'))

  const handleColumnsClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget)
      setColumnsOpen(true)
    },
    [setAnchorEl, setColumnsOpen]
  )

  const handleFilterClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget)
      setFilterOpen(true)
    },
    [setAnchorEl, setFilterOpen]
  )

  const handleClose = useCallback(() => {
    setColumnsOpen(false)
    setFilterOpen(false)
    setAnchorEl(undefined)
  }, [])

  // toolbar with add, edit, delete, filter/search column select.
  return (
    <Toolbar className={classes.toolbar}>
      <div className={classes.leftButtons}>
        {onAdd && (
          <InstanceSmallIconActionButton
            instance={instance}
            icon={<AddIcon />}
            onClick={onAdd}
            label='Add'
            enabled={({ state }) =>
              !state.selectedRowIds || Object.keys(state.selectedRowIds).length === 0
            }
            variant='left'
          />
        )}
        {onEdit && (
          <InstanceSmallIconActionButton
            instance={instance}
            icon={<CreateIcon />}
            onClick={onEdit}
            label='Edit'
            enabled={({ state }) =>
              state.selectedRowIds && Object.keys(state.selectedRowIds).length === 1
            }
            variant='left'
          />
        )}
        {onDelete && (
          <InstanceSmallIconActionButton
            instance={instance}
            icon={<DeleteIcon />}
            onClick={onDelete}
            label='Delete'
            enabled={({ state }) =>
              state.selectedRowIds && Object.keys(state.selectedRowIds).length > 0
            }
            variant='left'
          />
        )}
      </div>
      <div className={classes.rightButtons}>
        <ColumnHidePage instance={instance} onClose={handleClose} show={columnsOpen} anchorEl={anchorEl} />
        <FilterPage instance={instance} onClose={handleClose} show={filterOpen} anchorEl={anchorEl} />
        {hideableColumns.length > 1 && (
          <SmallIconActionButton
            icon={<ViewColumnsIcon />}
            onClick={handleColumnsClick}
            label='Show / hide columns'
            variant='right'
          />
        )}
        <SmallIconActionButton
          icon={<FilterListIcon />}
          onClick={handleFilterClick}
          label='Filter by columns'
          variant='right'
        />
      </div>
    </Toolbar>
  )
}
