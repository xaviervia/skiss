webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(602);


/***/ },

/***/ 602:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _asCode = __webpack_require__(318);
	
	var _asCode2 = _interopRequireDefault(_asCode);
	
	var _syntheticComponent = __webpack_require__(603);
	
	var _syntheticComponent2 = _interopRequireDefault(_syntheticComponent);
	
	var _reactDom = __webpack_require__(35);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var comp = _react2.default.createElement(
	  'p',
	  { style: { background: 'red', width: '10px', height: '10px' } },
	  _react2.default.createElement(
	    'a',
	    { href: 'http://lelele' },
	    _react2.default.createElement(
	      'span',
	      null,
	      'aaasdfadf'
	    )
	  )
	);
	
	var MyP = (0, _syntheticComponent2.default)(comp, { children: _react.PropTypes.node }, 'MyP');
	
	var renderedMyP = _react2.default.createElement(
	  MyP,
	  null,
	  _react2.default.createElement(
	    'blockquote',
	    null,
	    'whats up'
	  )
	);
	
	(0, _reactDom.render)(_react2.default.createElement(
	  'div',
	  null,
	  _react2.default.createElement(MyP, { title: 'text' }),
	  _react2.default.createElement(
	    MyP,
	    null,
	    _react2.default.createElement(
	      'blockquote',
	      null,
	      'whats up'
	    )
	  ),
	  _react2.default.createElement('hr', null),
	  _react2.default.createElement(
	    'pre',
	    null,
	    (0, _asCode2.default)(_react2.default.createElement(MyP, null))
	  ),
	  _react2.default.createElement('hr', null),
	  _react2.default.createElement(
	    'pre',
	    null,
	    (0, _asCode2.default)(renderedMyP)
	  ),
	  _react2.default.createElement('hr', null),
	  _react2.default.createElement(
	    'pre',
	    null,
	    (0, _asCode2.default)(comp)
	  )
	), document.getElementById('skiss'));

/***/ },

/***/ 603:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = synteticComponent;
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function synteticComponent(nodeTree, propTypes, name) {
	  var SynteticComponent = function SynteticComponent(props) {
	    var children = props.children;
	
	    var otherProps = _objectWithoutProperties(props, ['children']);
	
	    if (children == null) {
	      return _react2.default.cloneElement(nodeTree, otherProps);
	    } else {
	      return _react2.default.cloneElement(nodeTree, otherProps, [nodeTree.props.children, children]);
	    }
	  };
	
	  SynteticComponent.displayName = name;
	  SynteticComponent.propTypes;
	
	  return SynteticComponent;
	}

/***/ }

});
//# sourceMappingURL=playground-419f08a85dadae8bdb1d.js.map