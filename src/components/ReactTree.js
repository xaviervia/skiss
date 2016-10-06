import React from 'react'
import {mapObjIndexed, values} from 'ramda'
import asCode from 'lib/asCode'

export default (dictionary) => {
  const node = ({type, props, children}, index) => {
    if (dictionary[type]) {
      const Type = dictionary[type]
      return <Type key={index} {...props}>
        {children && values(mapObjIndexed(node, children))}
      </Type>
    }

    switch (type) {
      case 'main':
        return <main key={index} {...props}>
          {children && values(mapObjIndexed(node, children))}
        </main>

      case 'div':
        return <div key={index} {...props}>
          {children && values(mapObjIndexed(node, children))}
        </div>

      case 'a':
        return <a key={index} {...props}>
          {children && values(mapObjIndexed(node, children))}
        </a>

      case 'text':
        return props.content
    }
  }

  return function ReactTree ({tree}) {
    const nodeTree = node(tree)
    return <div>
      {nodeTree}

      <hr />
      <code>
        <pre>{asCode(nodeTree)}</pre>
      </code>
    </div>
  }
}
