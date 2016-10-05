import {keys, lensPath, set} from 'ramda'
import {selectedPath, node} from './selectors'

export const initialState = {
  selected: [],
  add: {
    type: 'FlatButton',
    props: {
      primary: true,
      label: 'Epic'
    }
  },

  tree: {
    type: 'main',
    children: {
      '0': {
        type: 'div',
        props: {
          style: {
            padding: '20px'
          }
        },
        children: {
          '0': {
            type: 'text',
            props: {
              content: 'Text node'
            }
          },
          '1': {
            type: 'a',
            props: {
              href: 'http://google.com'
            },
            children: {
              '0': {
                type: 'text',
                props: {
                  content: 'All'
                }
              }
            }
          }
        }
      },

      '1': {
        type: 'RaisedButton',
        props: {
          label: 'Such Button, wow',
          primary: true
        }
      }
    }
  }
}

export const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_SELECTED':
      return {
        ...state,
        selected: action.payload
      }

    case 'EDIT_DATA':
      return set(
        lensPath(action.payload.path),
        action.payload.value,
        state
      )

    case 'ADD_CHILD':
      const currentNode = node(state.selected, state.tree)

      return {
        ...state,
        tree: set(
          selectedPath(state.selected),
          {
            ...currentNode,
            children: currentNode.children
              ? {
                ...currentNode.children,
                [`${keys(currentNode.children).length}`]: state.add
              }
              : {
                '0': state.add
              }
          },
          state.tree
        )
      }

    default:
      return state
  }
}
