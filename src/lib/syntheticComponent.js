import React from 'react'

export default function synteticComponent (nodeTree, propTypes, name) {
  const SynteticComponent = (props) => {
    const {children, ...otherProps} = props
    if (children == null) {
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
