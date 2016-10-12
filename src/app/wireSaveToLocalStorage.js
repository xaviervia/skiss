import {on} from 'flyd'

export default (push, states) => {
  if (window.localStorage.getItem('skiss')) {
    push({
      type: 'save/LOAD',
      payload: JSON.parse(window.localStorage.getItem('skiss'))
    })
  }

  on(
    (state) => {
      window.localStorage.setItem('skiss', JSON.stringify(state))
    },
    states
  )
}
