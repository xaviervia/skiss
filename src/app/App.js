import React, {Component} from 'react'
import TreeView from 'components/TreeView'
import Add from 'components/Add'
import Edit from 'components/Edit'
import dictionary from 'dictionary'
import getPropTypesFromDictionary from 'lib/getPropTypesFromDictionary'
import defaultPropTypesDictionary from 'lib/defaultPropTypesDictionary'
import asCode from 'lib/asCode'
import buildTree from 'lib/buildTree'
import {node} from './selectors'
import styles from './styles.css'

const propTypesDictionary = {
  ...getPropTypesFromDictionary(dictionary),
  ...defaultPropTypesDictionary
}

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
    const nodeTree = buildTree(dictionary)(tree)
    const currentNode = node(selected, tree)

    return <div>
      <section
        id='tree-view'
        className={styles.App_TreeView}>
        <TreeView
          tree={tree}
          onSelect={(selected) => push({
            type: 'selection/UPDATE',
            payload: selected
          })}
          selected={selected}
        />

        <pre className={styles.App_Code}>
          {asCode(nodeTree)}
        </pre>
      </section>

      <section
        id='react-tree'
        className={styles.App_ReactTree}>
        {nodeTree}
      </section>

      <section
        id='edit'
        className={styles.App_Edit}>
        <Edit
          onChange={(prop, value) => push({
            type: 'edit/UPDATE',
            payload: { [prop]: value }
          })}
          type={currentNode.type}
          props={currentNode.props}
          propTypesDictionary={propTypesDictionary}
        />

        <Add
          type={add.type}
          propTypesDictionary={propTypesDictionary}
          onType={(type) => push({
            type: 'add/UPDATE_TYPE',
            payload: type
          })}
          onSubmit={() => push({
            type: 'add/NEW_CHILD'
          })}
        />

        <button onClick={() => push({
          type: 'edit/REMOVE'
        })}>
          DELETE
        </button>
      </section>
    </div>
  }
}
