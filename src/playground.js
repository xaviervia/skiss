import React from 'react'
import {introspect} from 'patch-react-proptypes-add-introspection'
import {render} from 'react-dom'
import {mapObjIndexed} from 'ramda'
import Editor from 'components/Editor'

const {default: dictionary} = require('app/dictionary')

const propTypesDictionary = mapObjIndexed(
  (component) => component.propTypes && introspect(component.propTypes),
  dictionary
)

const data = {
  type: 'FlatButton',
  props: {
    href: 'http://google.com',
    primary: true
  },
  children: [
    {
      type: 'text',
      props: {
        content: 'Google'
      }
    }
  ]
}

render(
  <Editor
    data={data}
    propTypesDictionary={propTypesDictionary}
  />,
  document.getElementById('skiss')
)
