import { makeStyles } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles({
  truncated: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
})

export const TooltipCell = ({ cell: { value }, column: { align = 'left' } }) => (
  <Tooltip text={value} align={align} />
)

export const Tooltip = ({ text, tooltip = text, align }) => {
  const classes = useStyles({})
  return (
    <div className={classes.truncated} style={{ textAlign: align }}>
      <span title={tooltip}>{text}</span>
    </div>
  )
}
