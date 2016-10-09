import React from 'react'
import {keys, map} from 'ramda'

export default function Edit ({ propTypesDictionary, onEdit, add }) {
  console.log(propTypesDictionary)

  return <div>
    <h2>Add</h2>
    <select onChange=(e.)>
      {map(
        (key) => <option
          key={key}
          value={key}>
          {key}
        </option>,
        keys(propTypesDictionary)
      )}
    </select>
  </div>
}
