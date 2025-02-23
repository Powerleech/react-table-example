import { Theme } from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import React from 'react'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      flex: '1 0 auto',
    },
    progress: {
      margin: theme.spacing(2),
    },
  })
)

export const Loader = ({ error, retry, timedOut, pastDelay }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {error && (
        <div>
          Error! <button onClick={retry}>Retry</button>
        </div>
      )}
      {timedOut && (
        <div>
          Taking a long time... <button onClick={retry}>Retry</button>
        </div>
      )}
      {pastDelay && <div>Loading...</div>}
      <CircularProgress className={classes.progress} />
    </div>
  )
}
