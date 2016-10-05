import React from 'react'
import {equals, mapObjIndexed, values} from 'ramda'

export default function TreeView ({tree, onSelect, selected}) {
  return <ul>
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
    style={equals(path, selected) ? {background: 'lightgray'} : undefined}>
    {type}

    {children && <ul>
      {values(mapObjIndexed(
        (x, i) => node(x, [...path, i], {onSelect, selected}),
        children
      ))}
    </ul>}
  </li>
}
