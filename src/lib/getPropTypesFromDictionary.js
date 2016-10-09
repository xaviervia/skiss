import {compose, filter, keys, reduce} from 'ramda'
import {introspect} from 'patch-react-proptypes-add-introspection'

export default (dictionary) => compose(
  reduce((propTypesDictionary, key) => ({
    ...propTypesDictionary,
    [key]: introspect(dictionary[key].propTypes)
  }), {}),
  filter((key) => dictionary[key].propTypes != null),
  keys
)(dictionary)
