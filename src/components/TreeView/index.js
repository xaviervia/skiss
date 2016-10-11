import React from 'react'
import {equals, mapObjIndexed, values} from 'ramda'
import styles from './styles.css'

export default function TreeView ({tree, onSelect, selected}) {
  return <ul className={styles.TreeView}>
    {node(tree, [], {onSelect, selected})}
  </ul>
}

const node = ({type, children}, path, {onSelect, selected}) => {
  return <li
    key={path}
    id={`tree-${path.join('.')}`}
    onClick={(e) => {
      e.stopPropagation()

      onSelect(path)
    }}
    className={styles.TreeView_Node + ' ' + (equals(path, selected) ? styles.selected : '')}>
    {type}

    {children && <ul className={styles.TreeView}>
      {values(mapObjIndexed(
        (x, i) => node(x, [...path, i], {onSelect, selected}),
        children
      ))}
    </ul>}
  </li>
}
