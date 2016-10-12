import React, {PropTypes} from 'react'
import asCode from 'lib/asCode'
import syntheticComponent from 'lib/syntheticComponent'
import { render } from 'react-dom'

const comp = <p style={{background: 'red', width: '10px', height: '10px'}}>
  <a href='http://lelele'>
    <span>aaasdfadf</span>
  </a>
</p>

const MyP = syntheticComponent(comp, { children: PropTypes.node }, 'MyP')

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
