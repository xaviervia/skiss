import React from 'react'
import {compose, join, mapObjIndexed, values} from 'ramda'
import asCode from 'lib/asCode'

import styles from './styles.css'

export default function ({ nodeTrees }) {
  return <pre className={styles.Code}>
    {compose(
      join('\n\n'),
      values,
      mapObjIndexed(asFunction)
    )(nodeTrees)}
  </pre>
}

const indent = (s) =>
  s.split('\n').map((l, i) => i === 0 ? l : `  ${l}`).join('\n')

const asFunction = (nodeTree, name) => `function ${name} () {
  return ${indent(asCode(nodeTree))}
}`
