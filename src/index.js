import React from 'react'
import {render} from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import wireApp from './App'
import injectTapEventPlugin from 'react-tap-event-plugin'
import {initialState, reducer} from './store'
import {scan, stream} from 'flyd'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const push = stream()

const App = wireApp(
  push,
  scan(reducer, initialState, push)
)

render(
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>,
  document.getElementById('skiss')
)
