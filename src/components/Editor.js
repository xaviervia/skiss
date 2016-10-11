import React from 'react'
import Field from 'components/Field'
import {map, mapObjIndexed, values} from 'ramda'

export default function Editor ({ props, propTypes, onChange }) {
  console.log('TYPES', propTypes)

  return <div>
    {values(mapObjIndexed(
      ({type, structure, isRequired}, prop) => {
        switch (type) {
          case 'array':
            return <Field
              key={prop}
              prop={prop}
              props={props}>
              {props[prop] && map(
                (value) => <span>{value}</span>,
                props[prop]
              )}
            </Field>

          case 'bool':
            return <Field
              key={prop}
              prop={prop}
              props={props}>
              <input
                type='checkbox'
                checked={props[prop] || false}
                onChange={(e) => onChange(prop, e.target.value === 'on')}
              />
            </Field>

          case 'func':
            return <Field
              key={prop}
              prop={prop}
              props={props}>
              <select
                onChange={(e) => onChange(prop, e.target.value)}
                placeholder={prop}
                value={props[prop]}>
                <option value='noop'>Noop</option>
                <option value='alert'>Alert</option>
              </select>
            </Field>

          case 'number':
            return <Field
              key={prop}
              prop={prop}
              props={props}>
              <input
                type='number'
                value={props[prop] || 0}
                onChange={(e) => onChange(prop, parseInt(e.target.value, 10))}
              />
            </Field>

          case 'node':
            return <Field
              key={prop}
              prop={prop}
              props={props}>
              <em>Node</em>
            </Field>

          case 'oneOf':
            return <Field
              key={prop}
              prop={prop}
              props={props}>
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
            </Field>

          default:
            return <Field
              key={prop}
              prop={prop}
              props={props}>
              <input
                type='text'
                placeholder={prop}
                onChange={(e) => onChange(prop, e.target.value)}
                value={props[prop] || ''}
              />
            </Field>
        }
      },
      propTypes
    ))}
  </div>
}
