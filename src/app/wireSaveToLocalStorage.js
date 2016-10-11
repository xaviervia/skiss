import {on} from 'flyd'

export default (push, states) => {
  if (window.localStorage.getItem('skiss.selected')) {
    push({
      type: 'save/LOAD',
      payload: {
        add: JSON.parse(window.localStorage.getItem('skiss.add')),
        selected: JSON.parse(window.localStorage.getItem('skiss.selected')),
        tree: JSON.parse(window.localStorage.getItem('skiss.tree'))
      }
    })
  }

  on(
    (state) => {
      window.localStorage.setItem('skiss.selected', JSON.stringify(state.selected))
      window.localStorage.setItem('skiss.add', JSON.stringify(state.add))
      window.localStorage.setItem('skiss.tree', JSON.stringify(state.tree))
    },
    states
  )
}
