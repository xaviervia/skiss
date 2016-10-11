import React from 'react'
import {keys, map} from 'ramda'

export default function Add ({
  type,
  onType,
  onSubmit,
  propTypesDictionary
}) {
  return <div>
    <h2>Add</h2>
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

    <button onClick={onSubmit}>ADD</button>
  </div>
}
