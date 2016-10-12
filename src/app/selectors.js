import {compose, reduce, lensPath, view} from 'ramda'

export const expandSelected = (selected) => [
  selected[0],
  ...reduce((a, x) => [...a, 'children', x], [])(selected.slice(1))
]

export const selectedPath = compose(
  lensPath,
  expandSelected
)

export const node = (path, tree) => view(selectedPath(path), tree)
