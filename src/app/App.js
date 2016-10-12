import React, {Component} from 'react'

import TreeView from 'components/TreeView'
import Add from 'components/Add'
import Edit from 'components/Edit'
import Canvas from 'components/Canvas'
import Code from 'components/Code'

import dictionary from 'dictionary'
import getPropTypesFromDictionary from 'lib/getPropTypesFromDictionary'
import defaultPropTypesDictionary from 'lib/defaultPropTypesDictionary'
import buildTree from 'lib/buildTree'

import {mapObjIndexed, values} from 'ramda'

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
    const {add, trees, selected} = this.state.app
    const nodeTrees = mapObjIndexed((tree) => buildTree(dictionary)(tree), trees)
    const currentNode = node(selected, trees)

    return <div>
      <section
        id='tree-view'
        className={styles.App_TreeView}>
        {values(mapObjIndexed(
          (tree, name) => <div key={name}>
            <h2>{name}</h2>
            <TreeView
              tree={tree}
              onSelect={(selected) => push({
                type: 'selection/UPDATE',
                payload: [name, ...selected]
              })}
              selected={selected[0] === name ? selected.slice(1) : undefined}
            />
          </div>,
          trees
        ))}

        <Code nodeTrees={nodeTrees} />
      </section>

      <section
        id='react-tree'
        className={styles.App_ReactTree}>
        {values(mapObjIndexed(
          (nodeTree, name) => <div key={name}>
            <h2>{name}</h2>
            <Canvas>
              {nodeTree}
            </Canvas>
          </div>,
          nodeTrees
        ))}
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
