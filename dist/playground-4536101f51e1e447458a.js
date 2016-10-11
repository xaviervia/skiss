webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(597);


/***/ },

/***/ 597:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _patchReactProptypesAddIntrospection = __webpack_require__(534);
	
	var _reactDom = __webpack_require__(35);
	
	var _ramda = __webpack_require__(307);
	
	var _Editor = __webpack_require__(311);
	
	var _Editor2 = _interopRequireDefault(_Editor);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var _require = __webpack_require__(315);
	
	var dictionary = _require.default;
	
	
	var propTypesDictionary = (0, _ramda.mapObjIndexed)(function (component) {
	  return component.propTypes && (0, _patchReactProptypesAddIntrospection.introspect)(component.propTypes);
	}, dictionary);
	
	var data = {
	  type: 'FlatButton',
	  props: {
	    href: 'http://google.com',
	    primary: true
	  },
	  children: [{
	    type: 'text',
	    props: {
	      content: 'Google'
	    }
	  }]
	};
	
	(0, _reactDom.render)(_react2.default.createElement(_Editor2.default, {
	  data: data,
	  propTypesDictionary: propTypesDictionary
	}), document.getElementById('skiss'));

/***/ }

});
//# sourceMappingURL=playground-4536101f51e1e447458a.js.map