import React from 'react'
import Editor from 'components/Editor'

export default function Edit ({
  propTypesDictionary,
  onChange,
  type,
  props
}) {
  console.log(propTypesDictionary)

  return <div>
    <h2>Edit</h2>
    <h3>{type}</h3>

    <Editor
      onChange={onChange}
      props={props}
      propTypes={propTypesDictionary[type]}
    />
  </div>
}
