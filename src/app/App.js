import React, {Component} from 'react'
import getReactTree from 'components/ReactTree'
import TreeView from 'components/TreeView'
import Add from 'components/Add'
import dictionary from './dictionary'
import getPropTypesFromDictionary from 'lib/getPropTypesFromDictionary'
import defaultPropTypesDictionary from 'lib/defaultPropTypesDictionary'

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
                type: 'selection/UPDATE',
                payload: selected
              })}
              selected={selected}
            />
          </td>

          <td>
            <ReactTree tree={tree} />
          </td>

          <td>
            <Add
              type={add.type}
              props={add.props}
              propTypesDictionary={{
                ...getPropTypesFromDictionary(dictionary),
                ...defaultPropTypesDictionary
              }}
              onType={(type) => push({
                type: 'add/UPDATE_TYPE',
                payload: type
              })}
              onUpdate={(prop, value) => push({
                type: 'add/UPDATE_PROP',
                payload: { [prop]: value }
              })}
              onSubmit={() => push({
                type: 'add/NEW_CHILD'
              })}
            />
          </td>
        </tr>
      </tbody>
    </table>
  }
}
