import {compose, reduce, lensPath, view} from 'ramda'

export const expandSelected = reduce((a, x) => [...a, 'children', x], [])

export const selectedPath = compose(
  lensPath,
  expandSelected
)

export const node = (path, tree) => view(selectedPath(path), tree)
