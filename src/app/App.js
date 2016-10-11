import React, {Component} from 'react'
import TreeView from 'components/TreeView'
import Add from 'components/Add'
import dictionary from 'dictionary'
import getPropTypesFromDictionary from 'lib/getPropTypesFromDictionary'
import defaultPropTypesDictionary from 'lib/defaultPropTypesDictionary'
import asCode from 'lib/asCode'
import buildTree from 'lib/buildTree'
import styles from './styles.css'

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
      </section>
    </div>
  }
}
