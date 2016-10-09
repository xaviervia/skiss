import React from 'react'
import Editor from './Editor'
import {keys, map} from 'ramda'

export default function Add ({
  type,
  props,
  propTypesDictionary,
  onType,
  onUpdate,
  onSubmit
}) {
  return <div>
    <select
      onChange={(e) => onType(e.target.value)}
      value={type}>
      {map(
        (key) => <option
          key={key}
          value={key}>
          {key}
        </option>,
        keys(propTypesDictionary)
      )}
    </select>

    <Editor
      onChange={onUpdate}
      props={props}
      propTypes={propTypesDictionary[type]}
    />

    <button onClick={onSubmit}>ADD</button>
  </div>
}
