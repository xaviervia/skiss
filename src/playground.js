import React, {PropTypes} from 'react'
import asCode from 'lib/asCode'
import { render } from 'react-dom'

function synteticComponent (nodeTree, propTypes, name) {
  const SynteticComponent = (props) => {
    console.log(props)
    const {children, ...otherProps} = props
    console.log(children)
    console.log(otherProps)
    if (children == null) {
      console.log('here')
      return React.cloneElement(nodeTree, otherProps)
    } else {
      return React.cloneElement(
        nodeTree,
        otherProps,
        [nodeTree.props.children, children]
      )
    }
  }

  SynteticComponent.displayName = name
  SynteticComponent.propTypes

  return SynteticComponent
}

const comp = <p style={{background: 'red', width: '10px', height: '10px'}}>
  <a href='http://lelele'>
    <span>aaasdfadf</span>
  </a>
</p>

const MyP = synteticComponent(comp, { children: PropTypes.node }, 'MyP')

const renderedMyP = <MyP><blockquote>whats up</blockquote></MyP>

render(
  <div>
    <MyP title='text' />
    <MyP><blockquote>whats up</blockquote></MyP>
    <hr />
    <pre>
      {asCode(<MyP />)}
    </pre>

    <hr />
    <pre>
      {asCode(renderedMyP)}
    </pre>

    <hr />
    <pre>
      {asCode(comp)}
    </pre>
  </div>,
  document.getElementById('skiss')
)
