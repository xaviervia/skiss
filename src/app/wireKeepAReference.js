import {on} from 'flyd'

export default (push, states) => {
  on(
    (state) => {
      window.states = window.states || []
      window.states.push(state)
      window.state = state
    },
    states
  )
}
