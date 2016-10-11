import React from 'react'
import {mapObjIndexed, values} from 'ramda'

export default (dictionary) => {
  const node = ({type, props, children}, index) => {
    if (dictionary[type]) {
      const Type = dictionary[type]
      return <Type key={index} {...props}>
        {children && values(mapObjIndexed(node, children))}
      </Type>
    }

    if (type === 'text') {
      return props.content
    }
  }

  return node
}
