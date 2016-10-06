import React from 'react'
import {mapObjIndexed, values} from 'ramda'

export default function Edit ({
  onAdd,
  onEdit,
  add,
  edit,
  selectedPath
}) {
  return <div>
    <h2>Edit stuff</h2>
    {edit.type}

    {values(mapObjIndexed(
      input((a, b) => onEdit(['tree', ...selectedPath, ...a], b)),
      edit.props
    ))}

    <h2>Add stuff</h2>
    <input
      placeholder='Type'
      onChange={(e) => onEdit(['add', 'type'], e.target.value)}
      value={add.type}
    />

    {values(mapObjIndexed(input((a, b) => onEdit(['add', ...a], b)), add.props))}

    <button onClick={onAdd}>
      Add
    </button>
  </div>
}

const input = (onEdit) => (val, prop) => {
  switch (true) {
    case val === true || val === false:
      return <label key={prop}>
        <input
          type='checkbox'
          onChange={(e) => onEdit(['props', prop], !val)}
          checked={val}
        />
        {prop.toUpperCase()}
      </label>

    default:
      return <input
        key={prop}
        placeholder={prop.toUpperCase()}
        onChange={(e) => onEdit(['props', prop], e.target.value)}
        value={val}
      />
  }
}
