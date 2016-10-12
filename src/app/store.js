import {keys, set} from 'ramda'
import {selectedPath, node} from './selectors'

export const initialState = {
  selected: ['App'],

  add: {
    type: 'FlatButton',
    props: {
      primary: true,
      label: 'Epic'
    }
  },

  trees: {
    CustomButton: {
      type: 'button',
      props: {
        style: {
          padding: '10px',
          background: 'pink'
        }
      },

      children: {
        '0': {
          type: 'text',
          props: {
            content: 'Pink Button'
          }
        }
      }
    },

    App: {
      type: 'main',
      props: {
        style: {
          padding: '20px'
        }
      },

      children: {
        '0': {
          type: 'div',
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
}

export const reducer = (state, action) => {
  const currentNode = node(state.selected, state.trees)

  switch (action.type) {
    case 'selection/UPDATE':
      return {
        ...state,
        selected: action.payload
      }

    case 'edit/UPDATE':
      return {
        ...state,
        trees: set(
          selectedPath(state.selected),
          {
            ...currentNode,
            props: {
              ...currentNode.props,
              ...action.payload
            }
          },
          state.trees
        )
      }

    case 'edit/REMOVE':
      return {
        ...state,
        selected: state.selected.slice(0, state.selected.length - 1),
        trees: set(
          selectedPath(state.selected),
          { type: undefined },
          state.trees
        )
      }

    case 'add/UPDATE_TYPE':
      // NOTE: It could also keep a "cache" of props set for a component type
      return {
        ...state,
        add: {
          type: action.payload,
          props: {}
        }
      }

    case 'add/UPDATE_PROP':
      return {
        ...state,
        add: {
          ...state.add,
          props: {
            ...state.add.props,
            ...action.payload
          }
        }
      }

    case 'add/NEW_CHILD':
      return {
        ...state,
        trees: set(
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
          state.trees
        )
      }

    case 'save/LOAD':
      return {
        ...state,
        ...action.payload
      }

    default:
      return state
  }
}
