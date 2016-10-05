import React, {Component} from 'react'
import getReactTree from './ReactTree'
import TreeView from './TreeView'
import Edit from './Edit'
import dictionary from './dictionary'
import {expandSelected, node} from './selectors'

const ReactTree = getReactTree(dictionary)

export default (push, states) => class App extends Component {
  constructor () {
    super()

    this.state = {
      app: states()
    }
  }

  componentDidMount () {
    states.map((state) => this.setState({ app: state }))
  }

  render () {
    const {add, tree, selected} = this.state.app

    return <table style={{width: '100%'}}>
      <tbody>
        <tr>
          <td>
            <TreeView
              tree={tree}
              onSelect={(selected) => push({
                type: 'UPDATE_SELECTED',
                payload: selected
              })}
              selected={selected}
            />
          </td>

          <td>
            <ReactTree tree={tree} />
          </td>

          <td>
            <Edit
              onAdd={() => push({
                type: 'ADD_CHILD'
              })}
              onEdit={(path, value) => push({
                type: 'EDIT_DATA',
                payload: {path, value}
              })}
              add={add}
              edit={node(selected, tree)}
              selectedPath={expandSelected(selected)}
            />
          </td>
        </tr>
      </tbody>
    </table>
  }
}
