import React from 'react'
import {render} from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import {scan, stream} from 'flyd'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import wireApp from 'app/App'
import wireKeepAReference from 'app/wireKeepAReference'
import wireSaveToLocalStorage from 'app/wireSaveToLocalStorage'
import {initialState, reducer} from 'app/store'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const push = stream()

const states = scan(reducer, initialState, push)

const App = wireApp(
  push,
  states
)

wireKeepAReference(push, states)
wireSaveToLocalStorage(push, states)

render(
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>,
  document.getElementById('skiss')
)
