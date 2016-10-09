import React from 'react'
import {map, mapObjIndexed, values} from 'ramda'

export default function Editor ({ props, propTypes, onChange }) {
  console.log('TYPES', propTypes)

  return <ul>
    {values(mapObjIndexed(
      ({type, structure, isRequired}, prop) => {
        switch (type) {
          case 'bool':
            return <li
              key={prop}>
              <label>
                {prop}
                <input
                  type='checkbox'
                  checked={props[prop] || false}
                  onChange={(e) => onChange(prop, e.target.value === 'on')}
                />
              </label>
            </li>

          case 'number':
            return <li key={prop}>
              <label>
                {prop}
                <input
                  type='number'
                  value={props[prop] || 0}
                  onChange={(e) => onChange(prop, parseInt(e.target.value, 10))}
                />
              </label>
            </li>

          case 'oneOf':
            return <li
              key={prop}>
              <label>
                {prop}
                <select
                  onChange={(e) => onChange(prop, e.target.value)}
                  placeholder={prop}
                  value={props[prop]}>
                  {map(
                    (value) => <option
                      key={value}
                      value={value}>
                      {value}
                    </option>,
                    structure
                  )}
                </select>
              </label>
            </li>

          default:
            return <li
              key={prop}>
              <label>
                {prop}
                <input
                  type='text'
                  placeholder={prop}
                  onChange={(e) => onChange(prop, e.target.value)}
                  value={props[prop] || ''}
                />
              </label>
            </li>
        }
      },
      propTypes
    ))}
  </ul>
}
