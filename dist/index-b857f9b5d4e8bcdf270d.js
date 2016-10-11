webpackJsonp([0],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },

/***/ 1:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(35);
	
	var _reactTapEventPlugin = __webpack_require__(174);
	
	var _reactTapEventPlugin2 = _interopRequireDefault(_reactTapEventPlugin);
	
	var _flyd = __webpack_require__(178);
	
	var _MuiThemeProvider = __webpack_require__(185);
	
	var _MuiThemeProvider2 = _interopRequireDefault(_MuiThemeProvider);
	
	var _App = __webpack_require__(305);
	
	var _App2 = _interopRequireDefault(_App);
	
	var _wireSaveToLocalStorage = __webpack_require__(595);
	
	var _wireSaveToLocalStorage2 = _interopRequireDefault(_wireSaveToLocalStorage);
	
	var _store = __webpack_require__(596);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Needed for onTouchTap
	// http://stackoverflow.com/a/34015469/988941
	(0, _reactTapEventPlugin2.default)();
	
	var push = (0, _flyd.stream)();
	
	var states = (0, _flyd.scan)(_store.reducer, _store.initialState, push);
	
	var App = (0, _App2.default)(push, states);
	
	(0, _wireSaveToLocalStorage2.default)(push, states);
	
	(0, _reactDom.render)(_react2.default.createElement(
	  _MuiThemeProvider2.default,
	  null,
	  _react2.default.createElement(App, null)
	), document.getElementById('skiss'));

/***/ },

/***/ 174:
/***/ function(module, exports, __webpack_require__) {

	var invariant = __webpack_require__(8);
	var defaultClickRejectionStrategy = __webpack_require__(175);
	
	var alreadyInjected = false;
	
	module.exports = function injectTapEventPlugin (strategyOverrides) {
	  strategyOverrides = strategyOverrides || {}
	  var shouldRejectClick = strategyOverrides.shouldRejectClick || defaultClickRejectionStrategy;
	
	  if ((undefined) !== 'production') {
	    invariant(
	      !alreadyInjected,
	      'injectTapEventPlugin(): Can only be called once per application lifecycle.\n\n\
	It is recommended to call injectTapEventPlugin() just before you call \
	ReactDOM.render(). If you are using an external library which calls injectTapEventPlugin() \
	itself, please contact the maintainer as it shouldn\'t be called in library code and \
	should be injected by the application.'
	    )
	  }
	
	  alreadyInjected = true;
	
	  __webpack_require__(44).injection.injectEventPluginsByName({
	    'TapEventPlugin':       __webpack_require__(176)(shouldRejectClick)
	  });
	};


/***/ },

/***/ 175:
/***/ function(module, exports) {

	module.exports = function(lastTouchEvent, clickTimestamp) {
	  if (lastTouchEvent && (clickTimestamp - lastTouchEvent) < 750) {
	    return true;
	  }
	};


/***/ },

/***/ 176:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2014 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 * @providesModule TapEventPlugin
	 * @typechecks static-only
	 */
	
	"use strict";
	
	var EventConstants = __webpack_require__(42);
	var EventPluginUtils = __webpack_require__(46);
	var EventPropagators = __webpack_require__(43);
	var SyntheticUIEvent = __webpack_require__(77);
	var TouchEventUtils = __webpack_require__(177);
	var ViewportMetrics = __webpack_require__(78);
	
	var keyOf = __webpack_require__(25);
	var topLevelTypes = EventConstants.topLevelTypes;
	
	var isStartish = EventPluginUtils.isStartish;
	var isEndish = EventPluginUtils.isEndish;
	
	var isTouch = function(topLevelType) {
	  var touchTypes = [
	    topLevelTypes.topTouchCancel,
	    topLevelTypes.topTouchEnd,
	    topLevelTypes.topTouchStart,
	    topLevelTypes.topTouchMove
	  ];
	  return touchTypes.indexOf(topLevelType) >= 0;
	}
	
	/**
	 * Number of pixels that are tolerated in between a `touchStart` and `touchEnd`
	 * in order to still be considered a 'tap' event.
	 */
	var tapMoveThreshold = 10;
	var ignoreMouseThreshold = 750;
	var startCoords = {x: null, y: null};
	var lastTouchEvent = null;
	
	var Axis = {
	  x: {page: 'pageX', client: 'clientX', envScroll: 'currentPageScrollLeft'},
	  y: {page: 'pageY', client: 'clientY', envScroll: 'currentPageScrollTop'}
	};
	
	function getAxisCoordOfEvent(axis, nativeEvent) {
	  var singleTouch = TouchEventUtils.extractSingleTouch(nativeEvent);
	  if (singleTouch) {
	    return singleTouch[axis.page];
	  }
	  return axis.page in nativeEvent ?
	    nativeEvent[axis.page] :
	    nativeEvent[axis.client] + ViewportMetrics[axis.envScroll];
	}
	
	function getDistance(coords, nativeEvent) {
	  var pageX = getAxisCoordOfEvent(Axis.x, nativeEvent);
	  var pageY = getAxisCoordOfEvent(Axis.y, nativeEvent);
	  return Math.pow(
	    Math.pow(pageX - coords.x, 2) + Math.pow(pageY - coords.y, 2),
	    0.5
	  );
	}
	
	var touchEvents = [
	  topLevelTypes.topTouchStart,
	  topLevelTypes.topTouchCancel,
	  topLevelTypes.topTouchEnd,
	  topLevelTypes.topTouchMove,
	];
	
	var dependencies = [
	  topLevelTypes.topMouseDown,
	  topLevelTypes.topMouseMove,
	  topLevelTypes.topMouseUp,
	].concat(touchEvents);
	
	var eventTypes = {
	  touchTap: {
	    phasedRegistrationNames: {
	      bubbled: keyOf({onTouchTap: null}),
	      captured: keyOf({onTouchTapCapture: null})
	    },
	    dependencies: dependencies
	  }
	};
	
	var now = (function() {
	  if (Date.now) {
	    return Date.now;
	  } else {
	    // IE8 support: http://stackoverflow.com/questions/9430357/please-explain-why-and-how-new-date-works-as-workaround-for-date-now-in
	    return function () {
	      return +new Date;
	    }
	  }
	})();
	
	function createTapEventPlugin(shouldRejectClick) {
	  return {
	
	    tapMoveThreshold: tapMoveThreshold,
	
	    ignoreMouseThreshold: ignoreMouseThreshold,
	
	    eventTypes: eventTypes,
	
	    /**
	     * @param {string} topLevelType Record from `EventConstants`.
	     * @param {DOMEventTarget} targetInst The listening component root node.
	     * @param {object} nativeEvent Native browser event.
	     * @return {*} An accumulation of synthetic events.
	     * @see {EventPluginHub.extractEvents}
	     */
	    extractEvents: function(
	      topLevelType,
	      targetInst,
	      nativeEvent,
	      nativeEventTarget
	    ) {
	
	      if (isTouch(topLevelType)) {
	        lastTouchEvent = now();
	      } else {
	        if (shouldRejectClick(lastTouchEvent, now())) {
	          return null;
	        }
	      }
	
	      if (!isStartish(topLevelType) && !isEndish(topLevelType)) {
	        return null;
	      }
	      var event = null;
	      var distance = getDistance(startCoords, nativeEvent);
	      if (isEndish(topLevelType) && distance < tapMoveThreshold) {
	        event = SyntheticUIEvent.getPooled(
	          eventTypes.touchTap,
	          targetInst,
	          nativeEvent,
	          nativeEventTarget
	        );
	      }
	      if (isStartish(topLevelType)) {
	        startCoords.x = getAxisCoordOfEvent(Axis.x, nativeEvent);
	        startCoords.y = getAxisCoordOfEvent(Axis.y, nativeEvent);
	      } else if (isEndish(topLevelType)) {
	        startCoords.x = 0;
	        startCoords.y = 0;
	      }
	      EventPropagators.accumulateTwoPhaseDispatches(event);
	      return event;
	    }
	
	  };
	}
	
	module.exports = createTapEventPlugin;


/***/ },

/***/ 177:
/***/ function(module, exports) {

	/**
	 * Copyright 2013-2014 Facebook, Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 * @providesModule TouchEventUtils
	 */
	
	var TouchEventUtils = {
	  /**
	   * Utility function for common case of extracting out the primary touch from a
	   * touch event.
	   * - `touchEnd` events usually do not have the `touches` property.
	   *   http://stackoverflow.com/questions/3666929/
	   *   mobile-sarai-touchend-event-not-firing-when-last-touch-is-removed
	   *
	   * @param {Event} nativeEvent Native event that may or may not be a touch.
	   * @return {TouchesObject?} an object with pageX and pageY or null.
	   */
	  extractSingleTouch: function(nativeEvent) {
	    var touches = nativeEvent.touches;
	    var changedTouches = nativeEvent.changedTouches;
	    var hasTouches = touches && touches.length > 0;
	    var hasChangedTouches = changedTouches && changedTouches.length > 0;
	
	    return !hasTouches && hasChangedTouches ? changedTouches[0] :
	           hasTouches ? touches[0] :
	           nativeEvent;
	  }
	};
	
	module.exports = TouchEventUtils;


/***/ },

/***/ 178:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var curryN = __webpack_require__(179);
	
	// Utility
	function isFunction(obj) {
	  return !!(obj && obj.constructor && obj.call && obj.apply);
	}
	function trueFn() { return true; }
	
	// Globals
	var toUpdate = [];
	var inStream;
	var order = [];
	var orderNextIdx = -1;
	var flushing = false;
	
	/** @namespace */
	var flyd = {}
	
	// /////////////////////////// API ///////////////////////////////// //
	
	/**
	 * Creates a new stream
	 *
	 * __Signature__: `a -> Stream a`
	 *
	 * @name flyd.stream
	 * @param {*} initialValue - (Optional) the initial value of the stream
	 * @return {stream} the stream
	 *
	 * @example
	 * var n = flyd.stream(1); // Stream with initial value `1`
	 * var s = flyd.stream(); // Stream with no initial value
	 */
	flyd.stream = function(initialValue) {
	  var endStream = createDependentStream([], trueFn);
	  var s = createStream();
	  s.end = endStream;
	  s.fnArgs = [];
	  endStream.listeners.push(s);
	  if (arguments.length > 0) s(initialValue);
	  return s;
	}
	
	/**
	 * Create a new dependent stream
	 *
	 * __Signature__: `(...Stream * -> Stream b -> b) -> [Stream *] -> Stream b`
	 *
	 * @name flyd.combine
	 * @param {Function} fn - the function used to combine the streams
	 * @param {Array<stream>} dependencies - the streams that this one depends on
	 * @return {stream} the dependent stream
	 *
	 * @example
	 * var n1 = flyd.stream(0);
	 * var n2 = flyd.stream(0);
	 * var max = flyd.combine(function(n1, n2, self, changed) {
	 *   return n1() > n2() ? n1() : n2();
	 * }, [n1, n2]);
	 */
	flyd.combine = curryN(2, combine);
	function combine(fn, streams) {
	  var i, s, deps, depEndStreams;
	  var endStream = createDependentStream([], trueFn);
	  deps = []; depEndStreams = [];
	  for (i = 0; i < streams.length; ++i) {
	    if (streams[i] !== undefined) {
	      deps.push(streams[i]);
	      if (streams[i].end !== undefined) depEndStreams.push(streams[i].end);
	    }
	  }
	  s = createDependentStream(deps, fn);
	  s.depsChanged = [];
	  s.fnArgs = s.deps.concat([s, s.depsChanged]);
	  s.end = endStream;
	  endStream.listeners.push(s);
	  addListeners(depEndStreams, endStream);
	  endStream.deps = depEndStreams;
	  updateStream(s);
	  return s;
	}
	
	/**
	 * Returns `true` if the supplied argument is a Flyd stream and `false` otherwise.
	 *
	 * __Signature__: `* -> Boolean`
	 *
	 * @name flyd.isStream
	 * @param {*} value - the value to test
	 * @return {Boolean} `true` if is a Flyd streamn, `false` otherwise
	 *
	 * @example
	 * var s = flyd.stream(1);
	 * var n = 1;
	 * flyd.isStream(s); //=> true
	 * flyd.isStream(n); //=> false
	 */
	flyd.isStream = function(stream) {
	  return isFunction(stream) && 'hasVal' in stream;
	}
	
	/**
	 * Invokes the body (the function to calculate the value) of a dependent stream
	 *
	 * By default the body of a dependent stream is only called when all the streams
	 * upon which it depends has a value. `immediate` can circumvent this behaviour.
	 * It immediately invokes the body of a dependent stream.
	 *
	 * __Signature__: `Stream a -> Stream a`
	 *
	 * @name flyd.immediate
	 * @param {stream} stream - the dependent stream
	 * @return {stream} the same stream
	 *
	 * @example
	 * var s = flyd.stream();
	 * var hasItems = flyd.immediate(flyd.combine(function(s) {
	 *   return s() !== undefined && s().length > 0;
	 * }, [s]);
	 * console.log(hasItems()); // logs `false`. Had `immediate` not been
	 *                          // used `hasItems()` would've returned `undefined`
	 * s([1]);
	 * console.log(hasItems()); // logs `true`.
	 * s([]);
	 * console.log(hasItems()); // logs `false`.
	 */
	flyd.immediate = function(s) {
	  if (s.depsMet === false) {
	    s.depsMet = true;
	    updateStream(s);
	  }
	  return s;
	}
	
	/**
	 * Changes which `endsStream` should trigger the ending of `s`.
	 *
	 * __Signature__: `Stream a -> Stream b -> Stream b`
	 *
	 * @name flyd.endsOn
	 * @param {stream} endStream - the stream to trigger the ending
	 * @param {stream} stream - the stream to be ended by the endStream
	 * @param {stream} the stream modified to be ended by endStream
	 *
	 * @example
	 * var n = flyd.stream(1);
	 * var killer = flyd.stream();
	 * // `double` ends when `n` ends or when `killer` emits any value
	 * var double = flyd.endsOn(flyd.merge(n.end, killer), flyd.combine(function(n) {
	 *   return 2 * n();
	 * }, [n]);
	*/
	flyd.endsOn = function(endS, s) {
	  detachDeps(s.end);
	  endS.listeners.push(s.end);
	  s.end.deps.push(endS);
	  return s;
	}
	
	/**
	 * Map a stream
	 *
	 * Returns a new stream consisting of every value from `s` passed through
	 * `fn`. I.e. `map` creates a new stream that listens to `s` and
	 * applies `fn` to every new value.
	 * __Signature__: `(a -> result) -> Stream a -> Stream result`
	 *
	 * @name flyd.map
	 * @param {Function} fn - the function that produces the elements of the new stream
	 * @param {stream} stream - the stream to map
	 * @return {stream} a new stream with the mapped values
	 *
	 * @example
	 * var numbers = flyd.stream(0);
	 * var squaredNumbers = flyd.map(function(n) { return n*n; }, numbers);
	 */
	// Library functions use self callback to accept (null, undefined) update triggers.
	flyd.map = curryN(2, function(f, s) {
	  return combine(function(s, self) { self(f(s.val)); }, [s]);
	})
	
	/**
	 * Listen to stream events
	 *
	 * Similar to `map` except that the returned stream is empty. Use `on` for doing
	 * side effects in reaction to stream changes. Use the returned stream only if you
	 * need to manually end it.
	 *
	 * __Signature__: `(a -> result) -> Stream a -> Stream undefined`
	 *
	 * @name flyd.on
	 * @param {Function} cb - the callback
	 * @param {stream} stream - the stream
	 * @return {stream} an empty stream (can be ended)
	 */
	flyd.on = curryN(2, function(f, s) {
	  return combine(function(s) { f(s.val); }, [s]);
	})
	
	/**
	 * Creates a new stream with the results of calling the function on every incoming
	 * stream with and accumulator and the incoming value.
	 *
	 * __Signature__: `(a -> b -> a) -> a -> Stream b -> Stream a`
	 *
	 * @name flyd.scan
	 * @param {Function} fn - the function to call
	 * @param {*} val - the initial value of the accumulator
	 * @param {stream} stream - the stream source
	 * @return {stream} the new stream
	 *
	 * @example
	 * var numbers = flyd.stream();
	 * var sum = flyd.scan(function(sum, n) { return sum+n; }, 0, numbers);
	 * numbers(2)(3)(5);
	 * sum(); // 10
	 */
	flyd.scan = curryN(3, function(f, acc, s) {
	  var ns = combine(function(s, self) {
	    self(acc = f(acc, s.val));
	  }, [s]);
	  if (!ns.hasVal) ns(acc);
	  return ns;
	});
	
	/**
	 * Creates a new stream down which all values from both `stream1` and `stream2`
	 * will be sent.
	 *
	 * __Signature__: `Stream a -> Stream a -> Stream a`
	 *
	 * @name flyd.merge
	 * @param {stream} source1 - one stream to be merged
	 * @param {stream} source2 - the other stream to be merged
	 * @return {stream} a stream with the values from both sources
	 *
	 * @example
	 * var btn1Clicks = flyd.stream();
	 * button1Elm.addEventListener(btn1Clicks);
	 * var btn2Clicks = flyd.stream();
	 * button2Elm.addEventListener(btn2Clicks);
	 * var allClicks = flyd.merge(btn1Clicks, btn2Clicks);
	 */
	flyd.merge = curryN(2, function(s1, s2) {
	  var s = flyd.immediate(combine(function(s1, s2, self, changed) {
	    if (changed[0]) {
	      self(changed[0]());
	    } else if (s1.hasVal) {
	      self(s1.val);
	    } else if (s2.hasVal) {
	      self(s2.val);
	    }
	  }, [s1, s2]));
	  flyd.endsOn(combine(function() {
	    return true;
	  }, [s1.end, s2.end]), s);
	  return s;
	});
	
	/**
	 * Creates a new stream resulting from applying `transducer` to `stream`.
	 *
	 * __Signature__: `Transducer -> Stream a -> Stream b`
	 *
	 * @name flyd.transduce
	 * @param {Transducer} xform - the transducer transformation
	 * @param {stream} source - the stream source
	 * @return {stream} the new stream
	 *
	 * @example
	 * var t = require('transducers.js');
	 *
	 * var results = [];
	 * var s1 = flyd.stream();
	 * var tx = t.compose(t.map(function(x) { return x * 2; }), t.dedupe());
	 * var s2 = flyd.transduce(tx, s1);
	 * flyd.combine(function(s2) { results.push(s2()); }, [s2]);
	 * s1(1)(1)(2)(3)(3)(3)(4);
	 * results; // => [2, 4, 6, 8]
	 */
	flyd.transduce = curryN(2, function(xform, source) {
	  xform = xform(new StreamTransformer());
	  return combine(function(source, self) {
	    var res = xform['@@transducer/step'](undefined, source.val);
	    if (res && res['@@transducer/reduced'] === true) {
	      self.end(true);
	      return res['@@transducer/value'];
	    } else {
	      return res;
	    }
	  }, [source]);
	});
	
	/**
	 * Returns `fn` curried to `n`. Use this function to curry functions exposed by
	 * modules for Flyd.
	 *
	 * @name flyd.curryN
	 * @function
	 * @param {Integer} arity - the function arity
	 * @param {Function} fn - the function to curry
	 * @return {Function} the curried function
	 *
	 * @example
	 * function add(x, y) { return x + y; };
	 * var a = flyd.curryN(2, add);
	 * a(2)(4) // => 6
	 */
	flyd.curryN = curryN
	
	/**
	 * Returns a new stream identical to the original except every
	 * value will be passed through `f`.
	 *
	 * _Note:_ This function is included in order to support the fantasy land
	 * specification.
	 *
	 * __Signature__: Called bound to `Stream a`: `(a -> b) -> Stream b`
	 *
	 * @name stream.map
	 * @param {Function} function - the function to apply
	 * @return {stream} a new stream with the values mapped
	 *
	 * @example
	 * var numbers = flyd.stream(0);
	 * var squaredNumbers = numbers.map(function(n) { return n*n; });
	 */
	function boundMap(f) { return flyd.map(f, this); }
	
	/**
	 * Returns a new stream which is the result of applying the
	 * functions from `this` stream to the values in `stream` parameter.
	 *
	 * `this` stream must be a stream of functions.
	 *
	 * _Note:_ This function is included in order to support the fantasy land
	 * specification.
	 *
	 * __Signature__: Called bound to `Stream (a -> b)`: `a -> Stream b`
	 *
	 * @name stream.ap
	 * @param {stream} stream - the values stream
	 * @return {stream} a new stram with the functions applied to values
	 *
	 * @example
	 * var add = flyd.curryN(2, function(x, y) { return x + y; });
	 * var numbers1 = flyd.stream();
	 * var numbers2 = flyd.stream();
	 * var addToNumbers1 = flyd.map(add, numbers1);
	 * var added = addToNumbers1.ap(numbers2);
	 */
	function ap(s2) {
	  var s1 = this;
	  return combine(function(s1, s2, self) { self(s1.val(s2.val)); }, [s1, s2]);
	}
	
	/**
	 * Get a human readable view of a stream
	 * @name stream.toString
	 * @return {String} the stream string representation
	 */
	function streamToString() {
	  return 'stream(' + this.val + ')';
	}
	
	/**
	 * @name stream.end
	 * @memberof stream
	 * A stream that emits `true` when the stream ends. If `true` is pushed down the
	 * stream the parent stream ends.
	 */
	
	/**
	 * @name stream.of
	 * @function
	 * @memberof stream
	 * Returns a new stream with `value` as its initial value. It is identical to
	 * calling `flyd.stream` with one argument.
	 *
	 * __Signature__: Called bound to `Stream (a)`: `b -> Stream b`
	 *
	 * @param {*} value - the initial value
	 * @return {stream} the new stream
	 *
	 * @example
	 * var n = flyd.stream(1);
	 * var m = n.of(1);
	 */
	
	// /////////////////////////// PRIVATE ///////////////////////////////// //
	/**
	 * @private
	 * Create a stream with no dependencies and no value
	 * @return {Function} a flyd stream
	 */
	function createStream() {
	  function s(n) {
	    if (arguments.length === 0) return s.val
	    updateStreamValue(s, n)
	    return s
	  }
	  s.hasVal = false;
	  s.val = undefined;
	  s.vals = [];
	  s.listeners = [];
	  s.queued = false;
	  s.end = undefined;
	  s.map = boundMap;
	  s.ap = ap;
	  s.of = flyd.stream;
	  s.toString = streamToString;
	  return s;
	}
	
	/**
	 * @private
	 * Create a dependent stream
	 * @param {Array<stream>} dependencies - an array of the streams
	 * @param {Function} fn - the function used to calculate the new stream value
	 * from the dependencies
	 * @return {stream} the created stream
	 */
	function createDependentStream(deps, fn) {
	  var s = createStream();
	  s.fn = fn;
	  s.deps = deps;
	  s.depsMet = false;
	  s.depsChanged = deps.length > 0 ? [] : undefined;
	  s.shouldUpdate = false;
	  addListeners(deps, s);
	  return s;
	}
	
	/**
	 * @private
	 * Check if all the dependencies have values
	 * @param {stream} stream - the stream to check depencencies from
	 * @return {Boolean} `true` if all dependencies have vales, `false` otherwise
	 */
	function initialDepsNotMet(stream) {
	  stream.depsMet = stream.deps.every(function(s) {
	    return s.hasVal;
	  });
	  return !stream.depsMet;
	}
	
	/**
	 * @private
	 * Update a dependent stream using its dependencies in an atomic way
	 * @param {stream} stream - the stream to update
	 */
	function updateStream(s) {
	  if ((s.depsMet !== true && initialDepsNotMet(s)) ||
	      (s.end !== undefined && s.end.val === true)) return;
	  if (inStream !== undefined) {
	    toUpdate.push(s);
	    return;
	  }
	  inStream = s;
	  if (s.depsChanged) s.fnArgs[s.fnArgs.length - 1] = s.depsChanged;
	  var returnVal = s.fn.apply(s.fn, s.fnArgs);
	  if (returnVal !== undefined) {
	    s(returnVal);
	  }
	  inStream = undefined;
	  if (s.depsChanged !== undefined) s.depsChanged = [];
	  s.shouldUpdate = false;
	  if (flushing === false) flushUpdate();
	}
	
	/**
	 * @private
	 * Update the dependencies of a stream
	 * @param {stream} stream
	 */
	function updateDeps(s) {
	  var i, o, list
	  var listeners = s.listeners;
	  for (i = 0; i < listeners.length; ++i) {
	    list = listeners[i];
	    if (list.end === s) {
	      endStream(list);
	    } else {
	      if (list.depsChanged !== undefined) list.depsChanged.push(s);
	      list.shouldUpdate = true;
	      findDeps(list);
	    }
	  }
	  for (; orderNextIdx >= 0; --orderNextIdx) {
	    o = order[orderNextIdx];
	    if (o.shouldUpdate === true) updateStream(o);
	    o.queued = false;
	  }
	}
	
	/**
	 * @private
	 * Add stream dependencies to the global `order` queue.
	 * @param {stream} stream
	 * @see updateDeps
	 */
	function findDeps(s) {
	  var i
	  var listeners = s.listeners;
	  if (s.queued === false) {
	    s.queued = true;
	    for (i = 0; i < listeners.length; ++i) {
	      findDeps(listeners[i]);
	    }
	    order[++orderNextIdx] = s;
	  }
	}
	
	/**
	 * @private
	 */
	function flushUpdate() {
	  flushing = true;
	  while (toUpdate.length > 0) {
	    var s = toUpdate.shift();
	    if (s.vals.length > 0) s.val = s.vals.shift();
	    updateDeps(s);
	  }
	  flushing = false;
	}
	
	/**
	 * @private
	 * Push down a value into a stream
	 * @param {stream} stream
	 * @param {*} value
	 */
	function updateStreamValue(s, n) {
	  if (n !== undefined && n !== null && isFunction(n.then)) {
	    n.then(s);
	    return;
	  }
	  s.val = n;
	  s.hasVal = true;
	  if (inStream === undefined) {
	    flushing = true;
	    updateDeps(s);
	    if (toUpdate.length > 0) flushUpdate(); else flushing = false;
	  } else if (inStream === s) {
	    markListeners(s, s.listeners);
	  } else {
	    s.vals.push(n);
	    toUpdate.push(s);
	  }
	}
	
	/**
	 * @private
	 */
	function markListeners(s, lists) {
	  var i, list;
	  for (i = 0; i < lists.length; ++i) {
	    list = lists[i];
	    if (list.end !== s) {
	      if (list.depsChanged !== undefined) {
	        list.depsChanged.push(s);
	      }
	      list.shouldUpdate = true;
	    } else {
	      endStream(list);
	    }
	  }
	}
	
	/**
	 * @private
	 * Add dependencies to a stream
	 * @param {Array<stream>} dependencies
	 * @param {stream} stream
	 */
	function addListeners(deps, s) {
	  for (var i = 0; i < deps.length; ++i) {
	    deps[i].listeners.push(s);
	  }
	}
	
	/**
	 * @private
	 * Removes an stream from a dependency array
	 * @param {stream} stream
	 * @param {Array<stream>} dependencies
	 */
	function removeListener(s, listeners) {
	  var idx = listeners.indexOf(s);
	  listeners[idx] = listeners[listeners.length - 1];
	  listeners.length--;
	}
	
	/**
	 * @private
	 * Detach a stream from its dependencies
	 * @param {stream} stream
	 */
	function detachDeps(s) {
	  for (var i = 0; i < s.deps.length; ++i) {
	    removeListener(s, s.deps[i].listeners);
	  }
	  s.deps.length = 0;
	}
	
	/**
	 * @private
	 * Ends a stream
	 */
	function endStream(s) {
	  if (s.deps !== undefined) detachDeps(s);
	  if (s.end !== undefined) detachDeps(s.end);
	}
	
	/**
	 * @private
	 * transducer stream transformer
	 */
	function StreamTransformer() { }
	StreamTransformer.prototype['@@transducer/init'] = function() { };
	StreamTransformer.prototype['@@transducer/result'] = function() { };
	StreamTransformer.prototype['@@transducer/step'] = function(s, v) { return v; };
	
	module.exports = flyd;


/***/ },

/***/ 179:
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(180);
	var _curry1 = __webpack_require__(181);
	var _curry2 = __webpack_require__(183);
	var _curryN = __webpack_require__(184);
	
	
	/**
	 * Returns a curried equivalent of the provided function, with the specified
	 * arity. The curried function has two unusual capabilities. First, its
	 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
	 * following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	 * following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @since v0.5.0
	 * @category Function
	 * @sig Number -> (* -> a) -> (* -> a)
	 * @param {Number} length The arity for the returned function.
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curry
	 * @example
	 *
	 *      var sumArgs = (...args) => R.sum(args);
	 *
	 *      var curriedAddFourNumbers = R.curryN(4, sumArgs);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry2(function curryN(length, fn) {
	  if (length === 1) {
	    return _curry1(fn);
	  }
	  return _arity(length, _curryN(length, [], fn));
	});


/***/ },

/***/ 180:
/***/ function(module, exports) {

	module.exports = function _arity(n, fn) {
	  /* eslint-disable no-unused-vars */
	  switch (n) {
	    case 0: return function() { return fn.apply(this, arguments); };
	    case 1: return function(a0) { return fn.apply(this, arguments); };
	    case 2: return function(a0, a1) { return fn.apply(this, arguments); };
	    case 3: return function(a0, a1, a2) { return fn.apply(this, arguments); };
	    case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments); };
	    case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
	    case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
	    case 7: return function(a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
	    case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
	    case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
	    case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
	    default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
	  }
	};


/***/ },

/***/ 181:
/***/ function(module, exports, __webpack_require__) {

	var _isPlaceholder = __webpack_require__(182);
	
	
	/**
	 * Optimized internal one-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry1(fn) {
	  return function f1(a) {
	    if (arguments.length === 0 || _isPlaceholder(a)) {
	      return f1;
	    } else {
	      return fn.apply(this, arguments);
	    }
	  };
	};


/***/ },

/***/ 182:
/***/ function(module, exports) {

	module.exports = function _isPlaceholder(a) {
	  return a != null &&
	         typeof a === 'object' &&
	         a['@@functional/placeholder'] === true;
	};


/***/ },

/***/ 183:
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(181);
	var _isPlaceholder = __webpack_require__(182);
	
	
	/**
	 * Optimized internal two-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry2(fn) {
	  return function f2(a, b) {
	    switch (arguments.length) {
	      case 0:
	        return f2;
	      case 1:
	        return _isPlaceholder(a) ? f2
	             : _curry1(function(_b) { return fn(a, _b); });
	      default:
	        return _isPlaceholder(a) && _isPlaceholder(b) ? f2
	             : _isPlaceholder(a) ? _curry1(function(_a) { return fn(_a, b); })
	             : _isPlaceholder(b) ? _curry1(function(_b) { return fn(a, _b); })
	             : fn(a, b);
	    }
	  };
	};


/***/ },

/***/ 184:
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(180);
	var _isPlaceholder = __webpack_require__(182);
	
	
	/**
	 * Internal curryN function.
	 *
	 * @private
	 * @category Function
	 * @param {Number} length The arity of the curried function.
	 * @param {Array} received An array of arguments received thus far.
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curryN(length, received, fn) {
	  return function() {
	    var combined = [];
	    var argsIdx = 0;
	    var left = length;
	    var combinedIdx = 0;
	    while (combinedIdx < received.length || argsIdx < arguments.length) {
	      var result;
	      if (combinedIdx < received.length &&
	          (!_isPlaceholder(received[combinedIdx]) ||
	           argsIdx >= arguments.length)) {
	        result = received[combinedIdx];
	      } else {
	        result = arguments[argsIdx];
	        argsIdx += 1;
	      }
	      combined[combinedIdx] = result;
	      if (!_isPlaceholder(result)) {
	        left -= 1;
	      }
	      combinedIdx += 1;
	    }
	    return left <= 0 ? fn.apply(this, combined)
	                     : _arity(left, _curryN(length, combined, fn));
	  };
	};


/***/ },

/***/ 305:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _TreeView = __webpack_require__(306);
	
	var _TreeView2 = _interopRequireDefault(_TreeView);
	
	var _Add = __webpack_require__(310);
	
	var _Add2 = _interopRequireDefault(_Add);
	
	var _Edit = __webpack_require__(311);
	
	var _Edit2 = _interopRequireDefault(_Edit);
	
	var _dictionary = __webpack_require__(315);
	
	var _dictionary2 = _interopRequireDefault(_dictionary);
	
	var _getPropTypesFromDictionary = __webpack_require__(533);
	
	var _getPropTypesFromDictionary2 = _interopRequireDefault(_getPropTypesFromDictionary);
	
	var _defaultPropTypesDictionary = __webpack_require__(535);
	
	var _defaultPropTypesDictionary2 = _interopRequireDefault(_defaultPropTypesDictionary);
	
	var _asCode = __webpack_require__(536);
	
	var _asCode2 = _interopRequireDefault(_asCode);
	
	var _buildTree = __webpack_require__(592);
	
	var _buildTree2 = _interopRequireDefault(_buildTree);
	
	var _selectors = __webpack_require__(593);
	
	var _styles = __webpack_require__(594);
	
	var _styles2 = _interopRequireDefault(_styles);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }
	
	var propTypesDictionary = _extends({}, (0, _getPropTypesFromDictionary2.default)(_dictionary2.default), _defaultPropTypesDictionary2.default);
	
	exports.default = function (push, states) {
	  return function (_Component) {
	    _inherits(App, _Component);
	
	    function App() {
	      _classCallCheck(this, App);
	
	      var _this = _possibleConstructorReturn(this, _Component.call(this));
	
	      _this.state = {
	        app: states()
	      };
	      return _this;
	    }
	
	    App.prototype.componentDidMount = function componentDidMount() {
	      var _this2 = this;
	
	      states.map(function (state) {
	        return _this2.setState({ app: state });
	      });
	    };
	
	    App.prototype.render = function render() {
	      var _state$app = this.state.app;
	      var add = _state$app.add;
	      var tree = _state$app.tree;
	      var selected = _state$app.selected;
	
	      var nodeTree = (0, _buildTree2.default)(_dictionary2.default)(tree);
	      var currentNode = (0, _selectors.node)(selected, tree);
	
	      return _react2.default.createElement(
	        'div',
	        null,
	        _react2.default.createElement(
	          'section',
	          {
	            id: 'tree-view',
	            className: _styles2.default.App_TreeView },
	          _react2.default.createElement(_TreeView2.default, {
	            tree: tree,
	            onSelect: function onSelect(selected) {
	              return push({
	                type: 'selection/UPDATE',
	                payload: selected
	              });
	            },
	            selected: selected
	          }),
	          _react2.default.createElement(
	            'pre',
	            { className: _styles2.default.App_Code },
	            (0, _asCode2.default)(nodeTree)
	          )
	        ),
	        _react2.default.createElement(
	          'section',
	          {
	            id: 'react-tree',
	            className: _styles2.default.App_ReactTree },
	          nodeTree
	        ),
	        _react2.default.createElement(
	          'section',
	          {
	            id: 'edit',
	            className: _styles2.default.App_Edit },
	          _react2.default.createElement(_Edit2.default, {
	            onChange: function onChange(prop, value) {
	              return push({
	                type: 'edit/UPDATE',
	                payload: _defineProperty({}, prop, value)
	              });
	            },
	            type: currentNode.type,
	            props: currentNode.props,
	            propTypesDictionary: propTypesDictionary
	          }),
	          _react2.default.createElement(_Add2.default, {
	            type: add.type,
	            propTypesDictionary: propTypesDictionary,
	            onType: function onType(type) {
	              return push({
	                type: 'add/UPDATE_TYPE',
	                payload: type
	              });
	            },
	            onSubmit: function onSubmit() {
	              return push({
	                type: 'add/NEW_CHILD'
	              });
	            }
	          })
	        )
	      );
	    };
	
	    return App;
	  }(_react.Component);
	};

/***/ },

/***/ 306:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = TreeView;
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _ramda = __webpack_require__(307);
	
	var _styles = __webpack_require__(308);
	
	var _styles2 = _interopRequireDefault(_styles);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function TreeView(_ref) {
	  var tree = _ref.tree;
	  var onSelect = _ref.onSelect;
	  var selected = _ref.selected;
	
	  return _react2.default.createElement(
	    'ul',
	    { className: _styles2.default.TreeView },
	    node(tree, [], { onSelect: onSelect, selected: selected })
	  );
	}
	
	var node = function node(_ref2, path, _ref3) {
	  var type = _ref2.type;
	  var children = _ref2.children;
	  var onSelect = _ref3.onSelect;
	  var selected = _ref3.selected;
	
	  return _react2.default.createElement(
	    'li',
	    {
	      key: path,
	      id: 'tree-' + path.join('.'),
	      onClick: function onClick(e) {
	        e.stopPropagation();
	
	        onSelect(path);
	      },
	      className: _styles2.default.TreeView_Node + ' ' + ((0, _ramda.equals)(path, selected) ? _styles2.default.selected : '') },
	    type,
	    children && _react2.default.createElement(
	      'ul',
	      { className: _styles2.default.TreeView },
	      (0, _ramda.values)((0, _ramda.mapObjIndexed)(function (x, i) {
	        return node(x, [].concat(_toConsumableArray(path), [i]), { onSelect: onSelect, selected: selected });
	      }, children))
	    )
	  );
	};

/***/ },

/***/ 308:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin
	module.exports = {"TreeView":"components-TreeView-TreeView-1wV4Q","TreeView_Node":"components-TreeView-TreeView_Node-3FibS","selected":"components-TreeView-selected-3jvHA"};

/***/ },

/***/ 310:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = Add;
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _ramda = __webpack_require__(307);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function Add(_ref) {
	  var type = _ref.type;
	  var onType = _ref.onType;
	  var onSubmit = _ref.onSubmit;
	  var propTypesDictionary = _ref.propTypesDictionary;
	
	  return _react2.default.createElement(
	    'div',
	    null,
	    _react2.default.createElement(
	      'h2',
	      null,
	      'Add'
	    ),
	    _react2.default.createElement(
	      'select',
	      {
	        onChange: function onChange(e) {
	          return onType(e.target.value);
	        },
	        value: type },
	      (0, _ramda.map)(function (key) {
	        return _react2.default.createElement(
	          'option',
	          {
	            key: key,
	            value: key },
	          key
	        );
	      }, (0, _ramda.keys)(propTypesDictionary))
	    ),
	    _react2.default.createElement(
	      'button',
	      { onClick: onSubmit },
	      'ADD'
	    )
	  );
	}

/***/ },

/***/ 311:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = Edit;
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _Editor = __webpack_require__(312);
	
	var _Editor2 = _interopRequireDefault(_Editor);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function Edit(_ref) {
	  var propTypesDictionary = _ref.propTypesDictionary;
	  var onChange = _ref.onChange;
	  var type = _ref.type;
	  var props = _ref.props;
	
	  console.log(propTypesDictionary);
	
	  return _react2.default.createElement(
	    'div',
	    null,
	    _react2.default.createElement(
	      'h2',
	      null,
	      'Edit'
	    ),
	    _react2.default.createElement(
	      'h3',
	      null,
	      type
	    ),
	    _react2.default.createElement(_Editor2.default, {
	      onChange: onChange,
	      props: props,
	      propTypes: propTypesDictionary[type]
	    })
	  );
	}

/***/ },

/***/ 533:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _ramda = __webpack_require__(307);
	
	var _patchReactProptypesAddIntrospection = __webpack_require__(534);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	exports.default = function (dictionary) {
	  return (0, _ramda.compose)((0, _ramda.reduce)(function (propTypesDictionary, key) {
	    return _extends({}, propTypesDictionary, _defineProperty({}, key, (0, _patchReactProptypesAddIntrospection.introspect)(dictionary[key].propTypes)));
	  }, {}), (0, _ramda.filter)(function (key) {
	    return dictionary[key].propTypes != null;
	  }), _ramda.keys)(dictionary);
	};

/***/ },

/***/ 535:
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  text: {
	    content: { type: 'string' }
	  }
	};

/***/ },

/***/ 536:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _flip = __webpack_require__(537);
	
	var _flip2 = _interopRequireDefault(_flip);
	
	var _map = __webpack_require__(540);
	
	var _map2 = _interopRequireDefault(_map);
	
	var _compose = __webpack_require__(555);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	var _times = __webpack_require__(564);
	
	var _times2 = _interopRequireDefault(_times);
	
	var _reactElementToJsxString = __webpack_require__(565);
	
	var _reactElementToJsxString2 = _interopRequireDefault(_reactElementToJsxString);
	
	var _stringifyObject = __webpack_require__(587);
	
	var _stringifyObject2 = _interopRequireDefault(_stringifyObject);
	
	var _react = __webpack_require__(2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var opts = {
	  showDefaultProps: false,
	  showFunctions: true,
	  useBooleanShorthandSyntax: true
	};
	
	var reFormatFunctionProp = function reFormatFunctionProp(code) {
	  return code.replace(/function ([a-zA-Z0-9]+)\((.*?)\) {\s*return ([\s\S]+?);\s*}}/g, '($2) => $3}');
	};
	
	var stripUndefinedProps = function stripUndefinedProps(code) {
	  return code.replace(/[a-zA-Z0-9]+={undefined}/g, '');
	};
	
	var stripEmptyLines = function stripEmptyLines(code) {
	  return code.split('\n').filter(function (line) {
	    return line.trim() !== '';
	  }).join('\n');
	};
	
	var toSingleQuote = function toSingleQuote(code) {
	  return code.replace(/"/g, "'");
	};
	
	var getIndentation = function getIndentation(string) {
	  return string.split('').reduce(function (result, char) {
	    return result.skip ? result : char === ' ' ? { count: result.count + 1, skip: false } : { count: result.count, skip: true };
	  }, { count: 0, skip: false }).count;
	};
	
	var reFormatObjectProps = function reFormatObjectProps(code) {
	  return code.split('\n').map(function (line) {
	    var matchObject = line.match(/{({.+?})}/);
	
	    if (matchObject) {
	      var _ret = function () {
	        var obj = eval('(' + matchObject[1] + ')'); // eslint-disable-line no-eval
	
	        if (Object.keys(obj).length === 1) {
	          return {
	            v: [line]
	          };
	        }
	
	        var lines = (0, _stringifyObject2.default)(obj, { indent: '  ' }).split('\n');
	        var baseIndentation = getIndentation(line);
	
	        lines[0] = line.replace(/{{.+?}}.*/, '{{');
	        lines[lines.length - 1] = '}}';
	
	        if (line.trim().endsWith('/>')) {
	          lines[lines.length - 1] = lines[lines.length - 1] + ' />';
	        } else if (line.trim().endsWith('>')) {
	          lines[lines.length - 1] = lines[lines.length - 1] + '>';
	        }
	
	        return {
	          v: lines.map(function (l, index) {
	            return index > 0 ? (0, _times2.default)(function () {
	              return ' ';
	            }, baseIndentation).join('') + l : l;
	          })
	        };
	      }();
	
	      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	    }
	
	    var matchArray = line.match(/{(\[.+?\])}/);
	    if (matchArray) {
	      try {
	        var _ret2 = function () {
	          var arr = eval('(' + matchArray[1] + ')'); // eslint-disable-line no-eval
	          var baseIndentation = getIndentation(line);
	
	          var lines = (0, _stringifyObject2.default)(arr, { indent: '  ' }).split('\n');
	          lines[0] = line.replace(/{\[.+?\]}.*/, '{[');
	          lines[lines.length - 1] = ']}';
	
	          if (line.trim().endsWith('/>')) {
	            lines[lines.length - 1] = lines[lines.length - 1] + ' />';
	          } else if (line.trim().endsWith('>')) {
	            lines[lines.length - 1] = lines[lines.length - 1] + '>';
	          }
	
	          return {
	            v: lines.map(function (l, index) {
	              return index > 0 ? (0, _times2.default)(function () {
	                return ' ';
	              }, baseIndentation).join('') + l : l;
	            })
	          };
	        }();
	
	        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
	      } catch (e) {
	        return [line];
	      }
	    }
	
	    return [line];
	  }).reduce(function (a, b) {
	    return a.concat(b);
	  }, []).join('\n');
	};
	
	var postProcessing = (0, _compose2.default)(stripEmptyLines, stripUndefinedProps, reFormatFunctionProp, reFormatObjectProps, toSingleQuote);
	
	var asCode = function asCode(children) {
	  return postProcessing((0, _map2.default)((0, _flip2.default)(_reactElementToJsxString2.default)(opts), _react.Children.toArray(children)).join('\n'));
	};
	
	exports.default = asCode;

/***/ },

/***/ 537:
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(181);
	var _slice = __webpack_require__(538);
	var curry = __webpack_require__(539);
	
	
	/**
	 * Returns a new function much like the supplied one, except that the first two
	 * arguments' order is reversed.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (a -> b -> c -> ... -> z) -> (b -> a -> c -> ... -> z)
	 * @param {Function} fn The function to invoke with its first two parameters reversed.
	 * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
	 * @example
	 *
	 *      var mergeThree = (a, b, c) => [].concat(a, b, c);
	 *
	 *      mergeThree(1, 2, 3); //=> [1, 2, 3]
	 *
	 *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
	 */
	module.exports = _curry1(function flip(fn) {
	  return curry(function(a, b) {
	    var args = _slice(arguments);
	    args[0] = b;
	    args[1] = a;
	    return fn.apply(this, args);
	  });
	});


/***/ },

/***/ 538:
/***/ function(module, exports) {

	/**
	 * An optimized, private array `slice` implementation.
	 *
	 * @private
	 * @param {Arguments|Array} args The array or arguments object to consider.
	 * @param {Number} [from=0] The array index to slice from, inclusive.
	 * @param {Number} [to=args.length] The array index to slice to, exclusive.
	 * @return {Array} A new, sliced array.
	 * @example
	 *
	 *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
	 *
	 *      var firstThreeArgs = function(a, b, c, d) {
	 *        return _slice(arguments, 0, 3);
	 *      };
	 *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
	 */
	module.exports = function _slice(args, from, to) {
	  switch (arguments.length) {
	    case 1: return _slice(args, 0, args.length);
	    case 2: return _slice(args, from, args.length);
	    default:
	      var list = [];
	      var idx = 0;
	      var len = Math.max(0, Math.min(args.length, to) - from);
	      while (idx < len) {
	        list[idx] = args[from + idx];
	        idx += 1;
	      }
	      return list;
	  }
	};


/***/ },

/***/ 539:
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(181);
	var curryN = __webpack_require__(179);
	
	
	/**
	 * Returns a curried equivalent of the provided function. The curried function
	 * has two unusual capabilities. First, its arguments needn't be provided one
	 * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
	 * following are equivalent:
	 *
	 *   - `g(1)(2)(3)`
	 *   - `g(1)(2, 3)`
	 *   - `g(1, 2)(3)`
	 *   - `g(1, 2, 3)`
	 *
	 * Secondly, the special placeholder value `R.__` may be used to specify
	 * "gaps", allowing partial application of any combination of arguments,
	 * regardless of their positions. If `g` is as above and `_` is `R.__`, the
	 * following are equivalent:
	 *
	 *   - `g(1, 2, 3)`
	 *   - `g(_, 2, 3)(1)`
	 *   - `g(_, _, 3)(1)(2)`
	 *   - `g(_, _, 3)(1, 2)`
	 *   - `g(_, 2)(1)(3)`
	 *   - `g(_, 2)(1, 3)`
	 *   - `g(_, 2)(_, 3)(1)`
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (* -> a) -> (* -> a)
	 * @param {Function} fn The function to curry.
	 * @return {Function} A new, curried function.
	 * @see R.curryN
	 * @example
	 *
	 *      var addFourNumbers = (a, b, c, d) => a + b + c + d;
	 *
	 *      var curriedAddFourNumbers = R.curry(addFourNumbers);
	 *      var f = curriedAddFourNumbers(1, 2);
	 *      var g = f(3);
	 *      g(4); //=> 10
	 */
	module.exports = _curry1(function curry(fn) {
	  return curryN(fn.length, fn);
	});


/***/ },

/***/ 540:
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(183);
	var _dispatchable = __webpack_require__(541);
	var _map = __webpack_require__(544);
	var _reduce = __webpack_require__(545);
	var _xmap = __webpack_require__(550);
	var curryN = __webpack_require__(179);
	var keys = __webpack_require__(552);
	
	
	/**
	 * Takes a function and
	 * a [functor](https://github.com/fantasyland/fantasy-land#functor),
	 * applies the function to each of the functor's values, and returns
	 * a functor of the same shape.
	 *
	 * Ramda provides suitable `map` implementations for `Array` and `Object`,
	 * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
	 *
	 * Dispatches to the `map` method of the second argument, if present.
	 *
	 * Acts as a transducer if a transformer is given in list position.
	 *
	 * Also treats functions as functors and will compose them together.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig Functor f => (a -> b) -> f a -> f b
	 * @param {Function} fn The function to be called on every element of the input `list`.
	 * @param {Array} list The list to be iterated over.
	 * @return {Array} The new list.
	 * @see R.transduce, R.addIndex
	 * @example
	 *
	 *      var double = x => x * 2;
	 *
	 *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
	 *
	 *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
	 */
	module.exports = _curry2(_dispatchable('map', _xmap, function map(fn, functor) {
	  switch (Object.prototype.toString.call(functor)) {
	    case '[object Function]':
	      return curryN(functor.length, function() {
	        return fn.call(this, functor.apply(this, arguments));
	      });
	    case '[object Object]':
	      return _reduce(function(acc, key) {
	        acc[key] = fn(functor[key]);
	        return acc;
	      }, {}, keys(functor));
	    default:
	      return _map(fn, functor);
	  }
	}));


/***/ },

/***/ 541:
/***/ function(module, exports, __webpack_require__) {

	var _isArray = __webpack_require__(542);
	var _isTransformer = __webpack_require__(543);
	var _slice = __webpack_require__(538);
	
	
	/**
	 * Returns a function that dispatches with different strategies based on the
	 * object in list position (last argument). If it is an array, executes [fn].
	 * Otherwise, if it has a function with [methodname], it will execute that
	 * function (functor case). Otherwise, if it is a transformer, uses transducer
	 * [xf] to return a new transformer (transducer case). Otherwise, it will
	 * default to executing [fn].
	 *
	 * @private
	 * @param {String} methodname property to check for a custom implementation
	 * @param {Function} xf transducer to initialize if object is transformer
	 * @param {Function} fn default ramda implementation
	 * @return {Function} A function that dispatches on object in list position
	 */
	module.exports = function _dispatchable(methodname, xf, fn) {
	  return function() {
	    var length = arguments.length;
	    if (length === 0) {
	      return fn();
	    }
	    var obj = arguments[length - 1];
	    if (!_isArray(obj)) {
	      var args = _slice(arguments, 0, length - 1);
	      if (typeof obj[methodname] === 'function') {
	        return obj[methodname].apply(obj, args);
	      }
	      if (_isTransformer(obj)) {
	        var transducer = xf.apply(null, args);
	        return transducer(obj);
	      }
	    }
	    return fn.apply(this, arguments);
	  };
	};


/***/ },

/***/ 542:
/***/ function(module, exports) {

	/**
	 * Tests whether or not an object is an array.
	 *
	 * @private
	 * @param {*} val The object to test.
	 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
	 * @example
	 *
	 *      _isArray([]); //=> true
	 *      _isArray(null); //=> false
	 *      _isArray({}); //=> false
	 */
	module.exports = Array.isArray || function _isArray(val) {
	  return (val != null &&
	          val.length >= 0 &&
	          Object.prototype.toString.call(val) === '[object Array]');
	};


/***/ },

/***/ 543:
/***/ function(module, exports) {

	module.exports = function _isTransformer(obj) {
	  return typeof obj['@@transducer/step'] === 'function';
	};


/***/ },

/***/ 544:
/***/ function(module, exports) {

	module.exports = function _map(fn, functor) {
	  var idx = 0;
	  var len = functor.length;
	  var result = Array(len);
	  while (idx < len) {
	    result[idx] = fn(functor[idx]);
	    idx += 1;
	  }
	  return result;
	};


/***/ },

/***/ 545:
/***/ function(module, exports, __webpack_require__) {

	var _xwrap = __webpack_require__(546);
	var bind = __webpack_require__(547);
	var isArrayLike = __webpack_require__(548);
	
	
	module.exports = (function() {
	  function _arrayReduce(xf, acc, list) {
	    var idx = 0;
	    var len = list.length;
	    while (idx < len) {
	      acc = xf['@@transducer/step'](acc, list[idx]);
	      if (acc && acc['@@transducer/reduced']) {
	        acc = acc['@@transducer/value'];
	        break;
	      }
	      idx += 1;
	    }
	    return xf['@@transducer/result'](acc);
	  }
	
	  function _iterableReduce(xf, acc, iter) {
	    var step = iter.next();
	    while (!step.done) {
	      acc = xf['@@transducer/step'](acc, step.value);
	      if (acc && acc['@@transducer/reduced']) {
	        acc = acc['@@transducer/value'];
	        break;
	      }
	      step = iter.next();
	    }
	    return xf['@@transducer/result'](acc);
	  }
	
	  function _methodReduce(xf, acc, obj) {
	    return xf['@@transducer/result'](obj.reduce(bind(xf['@@transducer/step'], xf), acc));
	  }
	
	  var symIterator = (typeof Symbol !== 'undefined') ? Symbol.iterator : '@@iterator';
	  return function _reduce(fn, acc, list) {
	    if (typeof fn === 'function') {
	      fn = _xwrap(fn);
	    }
	    if (isArrayLike(list)) {
	      return _arrayReduce(fn, acc, list);
	    }
	    if (typeof list.reduce === 'function') {
	      return _methodReduce(fn, acc, list);
	    }
	    if (list[symIterator] != null) {
	      return _iterableReduce(fn, acc, list[symIterator]());
	    }
	    if (typeof list.next === 'function') {
	      return _iterableReduce(fn, acc, list);
	    }
	    throw new TypeError('reduce: list must be array or iterable');
	  };
	}());


/***/ },

/***/ 546:
/***/ function(module, exports) {

	module.exports = (function() {
	  function XWrap(fn) {
	    this.f = fn;
	  }
	  XWrap.prototype['@@transducer/init'] = function() {
	    throw new Error('init not implemented on XWrap');
	  };
	  XWrap.prototype['@@transducer/result'] = function(acc) { return acc; };
	  XWrap.prototype['@@transducer/step'] = function(acc, x) {
	    return this.f(acc, x);
	  };
	
	  return function _xwrap(fn) { return new XWrap(fn); };
	}());


/***/ },

/***/ 547:
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(180);
	var _curry2 = __webpack_require__(183);
	
	
	/**
	 * Creates a function that is bound to a context.
	 * Note: `R.bind` does not provide the additional argument-binding capabilities of
	 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
	 *
	 * @func
	 * @memberOf R
	 * @since v0.6.0
	 * @category Function
	 * @category Object
	 * @sig (* -> *) -> {*} -> (* -> *)
	 * @param {Function} fn The function to bind to context
	 * @param {Object} thisObj The context to bind `fn` to
	 * @return {Function} A function that will execute in the context of `thisObj`.
	 * @see R.partial
	 * @example
	 *
	 *      var log = R.bind(console.log, console);
	 *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
	 *      // logs {a: 2}
	 */
	module.exports = _curry2(function bind(fn, thisObj) {
	  return _arity(fn.length, function() {
	    return fn.apply(thisObj, arguments);
	  });
	});


/***/ },

/***/ 548:
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(181);
	var _isArray = __webpack_require__(542);
	var _isString = __webpack_require__(549);
	
	
	/**
	 * Tests whether or not an object is similar to an array.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.5.0
	 * @category Type
	 * @category List
	 * @sig * -> Boolean
	 * @param {*} x The object to test.
	 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
	 * @example
	 *
	 *      R.isArrayLike([]); //=> true
	 *      R.isArrayLike(true); //=> false
	 *      R.isArrayLike({}); //=> false
	 *      R.isArrayLike({length: 10}); //=> false
	 *      R.isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
	 */
	module.exports = _curry1(function isArrayLike(x) {
	  if (_isArray(x)) { return true; }
	  if (!x) { return false; }
	  if (typeof x !== 'object') { return false; }
	  if (_isString(x)) { return false; }
	  if (x.nodeType === 1) { return !!x.length; }
	  if (x.length === 0) { return true; }
	  if (x.length > 0) {
	    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
	  }
	  return false;
	});


/***/ },

/***/ 549:
/***/ function(module, exports) {

	module.exports = function _isString(x) {
	  return Object.prototype.toString.call(x) === '[object String]';
	};


/***/ },

/***/ 550:
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(183);
	var _xfBase = __webpack_require__(551);
	
	
	module.exports = (function() {
	  function XMap(f, xf) {
	    this.xf = xf;
	    this.f = f;
	  }
	  XMap.prototype['@@transducer/init'] = _xfBase.init;
	  XMap.prototype['@@transducer/result'] = _xfBase.result;
	  XMap.prototype['@@transducer/step'] = function(result, input) {
	    return this.xf['@@transducer/step'](result, this.f(input));
	  };
	
	  return _curry2(function _xmap(f, xf) { return new XMap(f, xf); });
	}());


/***/ },

/***/ 551:
/***/ function(module, exports) {

	module.exports = {
	  init: function() {
	    return this.xf['@@transducer/init']();
	  },
	  result: function(result) {
	    return this.xf['@@transducer/result'](result);
	  }
	};


/***/ },

/***/ 552:
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(181);
	var _has = __webpack_require__(553);
	var _isArguments = __webpack_require__(554);
	
	
	/**
	 * Returns a list containing the names of all the enumerable own properties of
	 * the supplied object.
	 * Note that the order of the output array is not guaranteed to be consistent
	 * across different JS platforms.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Object
	 * @sig {k: v} -> [k]
	 * @param {Object} obj The object to extract properties from
	 * @return {Array} An array of the object's own properties.
	 * @example
	 *
	 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
	 */
	module.exports = (function() {
	  // cover IE < 9 keys issues
	  var hasEnumBug = !({toString: null}).propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString',
	                            'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
	  // Safari bug
	  var hasArgsEnumBug = (function() {
	    'use strict';
	    return arguments.propertyIsEnumerable('length');
	  }());
	
	  var contains = function contains(list, item) {
	    var idx = 0;
	    while (idx < list.length) {
	      if (list[idx] === item) {
	        return true;
	      }
	      idx += 1;
	    }
	    return false;
	  };
	
	  return typeof Object.keys === 'function' && !hasArgsEnumBug ?
	    _curry1(function keys(obj) {
	      return Object(obj) !== obj ? [] : Object.keys(obj);
	    }) :
	    _curry1(function keys(obj) {
	      if (Object(obj) !== obj) {
	        return [];
	      }
	      var prop, nIdx;
	      var ks = [];
	      var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
	      for (prop in obj) {
	        if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
	          ks[ks.length] = prop;
	        }
	      }
	      if (hasEnumBug) {
	        nIdx = nonEnumerableProps.length - 1;
	        while (nIdx >= 0) {
	          prop = nonEnumerableProps[nIdx];
	          if (_has(prop, obj) && !contains(ks, prop)) {
	            ks[ks.length] = prop;
	          }
	          nIdx -= 1;
	        }
	      }
	      return ks;
	    });
	}());


/***/ },

/***/ 553:
/***/ function(module, exports) {

	module.exports = function _has(prop, obj) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	};


/***/ },

/***/ 554:
/***/ function(module, exports, __webpack_require__) {

	var _has = __webpack_require__(553);
	
	
	module.exports = (function() {
	  var toString = Object.prototype.toString;
	  return toString.call(arguments) === '[object Arguments]' ?
	    function _isArguments(x) { return toString.call(x) === '[object Arguments]'; } :
	    function _isArguments(x) { return _has('callee', x); };
	}());


/***/ },

/***/ 555:
/***/ function(module, exports, __webpack_require__) {

	var pipe = __webpack_require__(556);
	var reverse = __webpack_require__(563);
	
	
	/**
	 * Performs right-to-left function composition. The rightmost function may have
	 * any arity; the remaining functions must be unary.
	 *
	 * **Note:** The result of compose is not automatically curried.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
	 * @param {...Function} functions
	 * @return {Function}
	 * @see R.pipe
	 * @example
	 *
	 *      var f = R.compose(R.inc, R.negate, Math.pow);
	 *
	 *      f(3, 4); // -(3^4) + 1
	 */
	module.exports = function compose() {
	  if (arguments.length === 0) {
	    throw new Error('compose requires at least one argument');
	  }
	  return pipe.apply(this, reverse(arguments));
	};


/***/ },

/***/ 556:
/***/ function(module, exports, __webpack_require__) {

	var _arity = __webpack_require__(180);
	var _pipe = __webpack_require__(557);
	var reduce = __webpack_require__(558);
	var tail = __webpack_require__(560);
	
	
	/**
	 * Performs left-to-right function composition. The leftmost function may have
	 * any arity; the remaining functions must be unary.
	 *
	 * In some libraries this function is named `sequence`.
	 *
	 * **Note:** The result of pipe is not automatically curried.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category Function
	 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
	 * @param {...Function} functions
	 * @return {Function}
	 * @see R.compose
	 * @example
	 *
	 *      var f = R.pipe(Math.pow, R.negate, R.inc);
	 *
	 *      f(3, 4); // -(3^4) + 1
	 */
	module.exports = function pipe() {
	  if (arguments.length === 0) {
	    throw new Error('pipe requires at least one argument');
	  }
	  return _arity(arguments[0].length,
	                reduce(_pipe, arguments[0], tail(arguments)));
	};


/***/ },

/***/ 557:
/***/ function(module, exports) {

	module.exports = function _pipe(f, g) {
	  return function() {
	    return g.call(this, f.apply(this, arguments));
	  };
	};


/***/ },

/***/ 558:
/***/ function(module, exports, __webpack_require__) {

	var _curry3 = __webpack_require__(559);
	var _reduce = __webpack_require__(545);
	
	
	/**
	 * Returns a single item by iterating through the list, successively calling
	 * the iterator function and passing it an accumulator value and the current
	 * value from the array, and then passing the result to the next call.
	 *
	 * The iterator function receives two values: *(acc, value)*. It may use
	 * `R.reduced` to shortcut the iteration.
	 *
	 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
	 * arrays), unlike the native `Array.prototype.reduce` method. For more details
	 * on this behavior, see:
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
	 *
	 * Dispatches to the `reduce` method of the third argument, if present.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig ((a, b) -> a) -> a -> [b] -> a
	 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
	 *        current element from the array.
	 * @param {*} acc The accumulator value.
	 * @param {Array} list The list to iterate over.
	 * @return {*} The final, accumulated value.
	 * @see R.reduced, R.addIndex
	 * @example
	 *
	 *      var numbers = [1, 2, 3];
	 *      var plus = (a, b) => a + b;
	 *
	 *      R.reduce(plus, 10, numbers); //=> 16
	 */
	module.exports = _curry3(_reduce);


/***/ },

/***/ 559:
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(181);
	var _curry2 = __webpack_require__(183);
	var _isPlaceholder = __webpack_require__(182);
	
	
	/**
	 * Optimized internal three-arity curry function.
	 *
	 * @private
	 * @category Function
	 * @param {Function} fn The function to curry.
	 * @return {Function} The curried function.
	 */
	module.exports = function _curry3(fn) {
	  return function f3(a, b, c) {
	    switch (arguments.length) {
	      case 0:
	        return f3;
	      case 1:
	        return _isPlaceholder(a) ? f3
	             : _curry2(function(_b, _c) { return fn(a, _b, _c); });
	      case 2:
	        return _isPlaceholder(a) && _isPlaceholder(b) ? f3
	             : _isPlaceholder(a) ? _curry2(function(_a, _c) { return fn(_a, b, _c); })
	             : _isPlaceholder(b) ? _curry2(function(_b, _c) { return fn(a, _b, _c); })
	             : _curry1(function(_c) { return fn(a, b, _c); });
	      default:
	        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3
	             : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function(_a, _b) { return fn(_a, _b, c); })
	             : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function(_a, _c) { return fn(_a, b, _c); })
	             : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function(_b, _c) { return fn(a, _b, _c); })
	             : _isPlaceholder(a) ? _curry1(function(_a) { return fn(_a, b, c); })
	             : _isPlaceholder(b) ? _curry1(function(_b) { return fn(a, _b, c); })
	             : _isPlaceholder(c) ? _curry1(function(_c) { return fn(a, b, _c); })
	             : fn(a, b, c);
	    }
	  };
	};


/***/ },

/***/ 560:
/***/ function(module, exports, __webpack_require__) {

	var _checkForMethod = __webpack_require__(561);
	var slice = __webpack_require__(562);
	
	
	/**
	 * Returns all but the first element of the given list or string (or object
	 * with a `tail` method).
	 *
	 * Dispatches to the `slice` method of the first argument, if present.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig [a] -> [a]
	 * @sig String -> String
	 * @param {*} list
	 * @return {*}
	 * @see R.head, R.init, R.last
	 * @example
	 *
	 *      R.tail([1, 2, 3]);  //=> [2, 3]
	 *      R.tail([1, 2]);     //=> [2]
	 *      R.tail([1]);        //=> []
	 *      R.tail([]);         //=> []
	 *
	 *      R.tail('abc');  //=> 'bc'
	 *      R.tail('ab');   //=> 'b'
	 *      R.tail('a');    //=> ''
	 *      R.tail('');     //=> ''
	 */
	module.exports = _checkForMethod('tail', slice(1, Infinity));


/***/ },

/***/ 561:
/***/ function(module, exports, __webpack_require__) {

	var _isArray = __webpack_require__(542);
	var _slice = __webpack_require__(538);
	
	
	/**
	 * Similar to hasMethod, this checks whether a function has a [methodname]
	 * function. If it isn't an array it will execute that function otherwise it
	 * will default to the ramda implementation.
	 *
	 * @private
	 * @param {Function} fn ramda implemtation
	 * @param {String} methodname property to check for a custom implementation
	 * @return {Object} Whatever the return value of the method is.
	 */
	module.exports = function _checkForMethod(methodname, fn) {
	  return function() {
	    var length = arguments.length;
	    if (length === 0) {
	      return fn();
	    }
	    var obj = arguments[length - 1];
	    return (_isArray(obj) || typeof obj[methodname] !== 'function') ?
	      fn.apply(this, arguments) :
	      obj[methodname].apply(obj, _slice(arguments, 0, length - 1));
	  };
	};


/***/ },

/***/ 562:
/***/ function(module, exports, __webpack_require__) {

	var _checkForMethod = __webpack_require__(561);
	var _curry3 = __webpack_require__(559);
	
	
	/**
	 * Returns the elements of the given list or string (or object with a `slice`
	 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
	 *
	 * Dispatches to the `slice` method of the third argument, if present.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.4
	 * @category List
	 * @sig Number -> Number -> [a] -> [a]
	 * @sig Number -> Number -> String -> String
	 * @param {Number} fromIndex The start index (inclusive).
	 * @param {Number} toIndex The end index (exclusive).
	 * @param {*} list
	 * @return {*}
	 * @example
	 *
	 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
	 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
	 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
	 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
	 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
	 */
	module.exports = _curry3(_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
	  return Array.prototype.slice.call(list, fromIndex, toIndex);
	}));


/***/ },

/***/ 563:
/***/ function(module, exports, __webpack_require__) {

	var _curry1 = __webpack_require__(181);
	var _isString = __webpack_require__(549);
	var _slice = __webpack_require__(538);
	
	
	/**
	 * Returns a new list or string with the elements or characters in reverse
	 * order.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.1.0
	 * @category List
	 * @sig [a] -> [a]
	 * @sig String -> String
	 * @param {Array|String} list
	 * @return {Array|String}
	 * @example
	 *
	 *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
	 *      R.reverse([1, 2]);     //=> [2, 1]
	 *      R.reverse([1]);        //=> [1]
	 *      R.reverse([]);         //=> []
	 *
	 *      R.reverse('abc');      //=> 'cba'
	 *      R.reverse('ab');       //=> 'ba'
	 *      R.reverse('a');        //=> 'a'
	 *      R.reverse('');         //=> ''
	 */
	module.exports = _curry1(function reverse(list) {
	  return _isString(list) ? list.split('').reverse().join('') :
	                           _slice(list).reverse();
	});


/***/ },

/***/ 564:
/***/ function(module, exports, __webpack_require__) {

	var _curry2 = __webpack_require__(183);
	
	
	/**
	 * Calls an input function `n` times, returning an array containing the results
	 * of those function calls.
	 *
	 * `fn` is passed one argument: The current value of `n`, which begins at `0`
	 * and is gradually incremented to `n - 1`.
	 *
	 * @func
	 * @memberOf R
	 * @since v0.2.3
	 * @category List
	 * @sig (Number -> a) -> Number -> [a]
	 * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
	 * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
	 * @return {Array} An array containing the return values of all calls to `fn`.
	 * @example
	 *
	 *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
	 */
	module.exports = _curry2(function times(fn, n) {
	  var len = Number(n);
	  var idx = 0;
	  var list;
	
	  if (len < 0 || isNaN(len)) {
	    throw new RangeError('n must be a non-negative number');
	  }
	  list = new Array(len);
	  while (idx < len) {
	    list[idx] = fn(idx);
	    idx += 1;
	  }
	  return list;
	});


/***/ },

/***/ 565:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _fill2 = __webpack_require__(566);
	
	var _fill3 = _interopRequireDefault(_fill2);
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	exports.default = reactElementToJSXString;
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _collapseWhiteSpace = __webpack_require__(582);
	
	var _collapseWhiteSpace2 = _interopRequireDefault(_collapseWhiteSpace);
	
	var _reactAddonsTestUtils = __webpack_require__(583);
	
	var _isPlainObject = __webpack_require__(585);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _stringifyObject = __webpack_require__(587);
	
	var _stringifyObject2 = _interopRequireDefault(_stringifyObject);
	
	var _sortobject = __webpack_require__(590);
	
	var _sortobject2 = _interopRequireDefault(_sortobject);
	
	var _traverse = __webpack_require__(591);
	
	var _traverse2 = _interopRequireDefault(_traverse);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function reactElementToJSXString(ReactElement) {
	  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	  var displayName = _ref.displayName;
	  var _ref$filterProps = _ref.filterProps;
	  var filterProps = _ref$filterProps === undefined ? [] : _ref$filterProps;
	  var _ref$showDefaultProps = _ref.showDefaultProps;
	  var showDefaultProps = _ref$showDefaultProps === undefined ? true : _ref$showDefaultProps;
	  var _ref$showFunctions = _ref.showFunctions;
	  var showFunctions = _ref$showFunctions === undefined ? false : _ref$showFunctions;
	  var _ref$useBooleanShorth = _ref.useBooleanShorthandSyntax;
	  var useBooleanShorthandSyntax = _ref$useBooleanShorth === undefined ? true : _ref$useBooleanShorth;
	
	  var getDisplayName = displayName || getDefaultDisplayName;
	
	  return toJSXString({ ReactElement: ReactElement });
	
	  function toJSXString(_ref2) {
	    var _ref2$ReactElement = _ref2.ReactElement;
	    var Element = _ref2$ReactElement === undefined ? null : _ref2$ReactElement;
	    var _ref2$lvl = _ref2.lvl;
	    var lvl = _ref2$lvl === undefined ? 0 : _ref2$lvl;
	    var _ref2$inline = _ref2.inline;
	    var inline = _ref2$inline === undefined ? false : _ref2$inline;
	
	    if (typeof Element === 'string' || typeof Element === 'number') {
	      return Element;
	    } else if (!(0, _reactAddonsTestUtils.isElement)(Element)) {
	      throw new Error('react-element-to-jsx-string: Expected a ReactElement,\ngot `' + (typeof Element === 'undefined' ? 'undefined' : _typeof(Element)) + '`');
	    }
	
	    var tagName = getDisplayName(Element);
	
	    var out = '<' + tagName;
	    var props = formatProps(Element.props, getDefaultProps(Element));
	    var attributes = [];
	    var children = _react2.default.Children.toArray(Element.props.children).filter(onlyMeaningfulChildren);
	
	    if (Element.ref !== null) {
	      attributes.push(getJSXAttribute('ref', Element.ref));
	    }
	
	    if (Element.key !== null &&
	    // React automatically add key=".X" when there are some children
	    !/^\./.test(Element.key)) {
	      attributes.push(getJSXAttribute('key', Element.key));
	    }
	
	    attributes = attributes.concat(props).filter(function (_ref3) {
	      var name = _ref3.name;
	      return filterProps.indexOf(name) === -1;
	    });
	
	    attributes.forEach(function (attribute) {
	      if (attributes.length === 1 || inline) {
	        out += ' ';
	      } else {
	        out += '\n' + spacer(lvl + 1);
	      }
	
	      if (useBooleanShorthandSyntax && attribute.value === '{true}') {
	        out += '' + attribute.name;
	      } else {
	        out += attribute.name + '=' + attribute.value;
	      }
	    });
	
	    if (attributes.length > 1 && !inline) {
	      out += '\n' + spacer(lvl);
	    }
	
	    if (children.length > 0) {
	      out += '>';
	      lvl++;
	      if (!inline) {
	        out += '\n';
	        out += spacer(lvl);
	      }
	
	      if (typeof children === 'string') {
	        out += children;
	      } else {
	        out += children.reduce(mergePlainStringChildren, []).map(recurse({ lvl: lvl, inline: inline })).join('\n' + spacer(lvl));
	      }
	      if (!inline) {
	        out += '\n';
	        out += spacer(lvl - 1);
	      }
	      out += '</' + tagName + '>';
	    } else {
	      if (attributes.length <= 1) {
	        out += ' ';
	      }
	
	      out += '/>';
	    }
	
	    return out;
	  }
	
	  function formatProps(props, defaultProps) {
	    var formatted = Object.keys(props).filter(noChildren);
	
	    if (useBooleanShorthandSyntax) {
	      formatted = formatted.filter(function (key) {
	        return noFalse(props[key]);
	      });
	    }
	
	    if (!showDefaultProps) {
	      formatted = formatted.filter(function (key) {
	        return defaultProps[key] ? defaultProps[key] !== props[key] : true;
	      });
	    }
	
	    return formatted.sort().map(function (propName) {
	      return getJSXAttribute(propName, props[propName]);
	    });
	  }
	
	  function getJSXAttribute(name, value) {
	    return {
	      name: name,
	      value: formatJSXAttribute(value).replace(/'?<__reactElementToJSXString__Wrapper__>/g, '').replace(/<\/__reactElementToJSXString__Wrapper__>'?/g, '')
	    };
	  }
	
	  function formatJSXAttribute(propValue) {
	    if (typeof propValue === 'string') {
	      return '"' + propValue + '"';
	    }
	
	    return '{' + formatValue(propValue) + '}';
	  }
	
	  function formatValue(value) {
	    var wrapper = '__reactElementToJSXString__Wrapper__';
	
	    if (typeof value === 'function' && !showFunctions) {
	      return function noRefCheck() {};
	    } else if ((0, _reactAddonsTestUtils.isElement)(value)) {
	      // we use this delimiter hack in cases where the react element is a property
	      // of an object from a root prop
	      // i.e.
	      //   reactElementToJSXString(<div a={{b: <div />}} />
	      //   // <div a={{b: <div />}} />
	      // we then remove the whole wrapping
	      // otherwise, the element would be surrounded by quotes: <div a={{b: '<div />'}} />
	      return '<' + wrapper + '>' + toJSXString({ ReactElement: value, inline: true }) + '</' + wrapper + '>';
	    } else if ((0, _isPlainObject2.default)(value) || Array.isArray(value)) {
	      return '<' + wrapper + '>' + stringifyObject(value) + '</' + wrapper + '>';
	    }
	
	    return value;
	  }
	
	  function recurse(_ref4) {
	    var lvl = _ref4.lvl;
	    var inline = _ref4.inline;
	
	    return function (Element) {
	      return toJSXString({ ReactElement: Element, lvl: lvl, inline: inline });
	    };
	  }
	
	  function stringifyObject(obj) {
	    if (Object.keys(obj).length > 0 || obj.length > 0) {
	      // eslint-disable-next-line array-callback-return
	      obj = (0, _traverse2.default)(obj).map(function (value) {
	        if ((0, _reactAddonsTestUtils.isElement)(value) || this.isLeaf) {
	          this.update(formatValue(value));
	        }
	      });
	
	      obj = (0, _sortobject2.default)(obj);
	    }
	
	    return (0, _collapseWhiteSpace2.default)((0, _stringifyObject2.default)(obj)).replace(/{ /g, '{').replace(/ }/g, '}').replace(/\[ /g, '[').replace(/ \]/g, ']');
	  }
	}
	
	function getDefaultDisplayName(ReactElement) {
	  return ReactElement.type.displayName || ReactElement.type.name || ( // function name
	  typeof ReactElement.type === 'function' ? // function without a name, you should provide one
	  'No Display Name' : ReactElement.type);
	}
	
	function getDefaultProps(ReactElement) {
	  return ReactElement.type.defaultProps || {};
	}
	
	function mergePlainStringChildren(prev, cur) {
	  var lastItem = prev[prev.length - 1];
	
	  if (typeof cur === 'number') {
	    cur = String(cur);
	  }
	
	  if (typeof lastItem === 'string' && typeof cur === 'string') {
	    prev[prev.length - 1] += cur;
	  } else {
	    prev.push(cur);
	  }
	
	  return prev;
	}
	
	function spacer(times) {
	  return (0, _fill3.default)(new Array(times), '  ').join('');
	}
	
	function noChildren(propName) {
	  return propName !== 'children';
	}
	
	function noFalse(propValue) {
	  return typeof propValue !== 'boolean' || propValue;
	}
	
	function onlyMeaningfulChildren(children) {
	  return children !== true && children !== false && children !== null && children !== '';
	}


/***/ },

/***/ 566:
/***/ function(module, exports, __webpack_require__) {

	var baseFill = __webpack_require__(567),
	    isIterateeCall = __webpack_require__(576);
	
	/**
	 * Fills elements of `array` with `value` from `start` up to, but not
	 * including, `end`.
	 *
	 * **Note:** This method mutates `array`.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.2.0
	 * @category Array
	 * @param {Array} array The array to fill.
	 * @param {*} value The value to fill `array` with.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns `array`.
	 * @example
	 *
	 * var array = [1, 2, 3];
	 *
	 * _.fill(array, 'a');
	 * console.log(array);
	 * // => ['a', 'a', 'a']
	 *
	 * _.fill(Array(3), 2);
	 * // => [2, 2, 2]
	 *
	 * _.fill([4, 6, 8, 10], '*', 1, 3);
	 * // => [4, '*', '*', 10]
	 */
	function fill(array, value, start, end) {
	  var length = array ? array.length : 0;
	  if (!length) {
	    return [];
	  }
	  if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
	    start = 0;
	    end = length;
	  }
	  return baseFill(array, value, start, end);
	}
	
	module.exports = fill;


/***/ },

/***/ 567:
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(568),
	    toLength = __webpack_require__(574);
	
	/**
	 * The base implementation of `_.fill` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to fill.
	 * @param {*} value The value to fill `array` with.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns `array`.
	 */
	function baseFill(array, value, start, end) {
	  var length = array.length;
	
	  start = toInteger(start);
	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = (end === undefined || end > length) ? length : toInteger(end);
	  if (end < 0) {
	    end += length;
	  }
	  end = start > end ? 0 : toLength(end);
	  while (start < end) {
	    array[start++] = value;
	  }
	  return array;
	}
	
	module.exports = baseFill;


/***/ },

/***/ 568:
/***/ function(module, exports, __webpack_require__) {

	var toFinite = __webpack_require__(569);
	
	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;
	
	  return result === result ? (remainder ? result - remainder : result) : 0;
	}
	
	module.exports = toInteger;


/***/ },

/***/ 569:
/***/ function(module, exports, __webpack_require__) {

	var toNumber = __webpack_require__(570);
	
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;
	
	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}
	
	module.exports = toFinite;


/***/ },

/***/ 570:
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(571),
	    isSymbol = __webpack_require__(572);
	
	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;
	
	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;
	
	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
	
	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;
	
	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;
	
	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;
	
	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}
	
	module.exports = toNumber;


/***/ },

/***/ 571:
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;


/***/ },

/***/ 572:
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(573);
	
	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}
	
	module.exports = isSymbol;


/***/ },

/***/ 573:
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },

/***/ 574:
/***/ function(module, exports, __webpack_require__) {

	var baseClamp = __webpack_require__(575),
	    toInteger = __webpack_require__(568);
	
	/** Used as references for the maximum length and index of an array. */
	var MAX_ARRAY_LENGTH = 4294967295;
	
	/**
	 * Converts `value` to an integer suitable for use as the length of an
	 * array-like object.
	 *
	 * **Note:** This method is based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toLength(3.2);
	 * // => 3
	 *
	 * _.toLength(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toLength(Infinity);
	 * // => 4294967295
	 *
	 * _.toLength('3.2');
	 * // => 3
	 */
	function toLength(value) {
	  return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
	}
	
	module.exports = toLength;


/***/ },

/***/ 575:
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.clamp` which doesn't coerce arguments.
	 *
	 * @private
	 * @param {number} number The number to clamp.
	 * @param {number} [lower] The lower bound.
	 * @param {number} upper The upper bound.
	 * @returns {number} Returns the clamped number.
	 */
	function baseClamp(number, lower, upper) {
	  if (number === number) {
	    if (upper !== undefined) {
	      number = number <= upper ? number : upper;
	    }
	    if (lower !== undefined) {
	      number = number >= lower ? number : lower;
	    }
	  }
	  return number;
	}
	
	module.exports = baseClamp;


/***/ },

/***/ 576:
/***/ function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(577),
	    isArrayLike = __webpack_require__(578),
	    isIndex = __webpack_require__(581),
	    isObject = __webpack_require__(571);
	
	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq(object[index], value);
	  }
	  return false;
	}
	
	module.exports = isIterateeCall;


/***/ },

/***/ 577:
/***/ function(module, exports) {

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}
	
	module.exports = eq;


/***/ },

/***/ 578:
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(579),
	    isLength = __webpack_require__(580);
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}
	
	module.exports = isArrayLike;


/***/ },

/***/ 579:
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(571);
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag || tag == proxyTag;
	}
	
	module.exports = isFunction;


/***/ },

/***/ 580:
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	module.exports = isLength;


/***/ },

/***/ 581:
/***/ function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}
	
	module.exports = isIndex;


/***/ },

/***/ 582:
/***/ function(module, exports) {

	/**
	 * @author Titus Wormer
	 * @copyright 2015 Titus Wormer
	 * @license MIT
	 * @module collapse-white-space
	 * @fileoverview Replace multiple white-space characters
	 *   with a single space.
	 */
	
	'use strict';
	
	/* Expose. */
	module.exports = collapse;
	
	/**
	 * Replace multiple white-space characters with a single space.
	 *
	 * @example
	 *   collapse(' \t\nbar \nbaz\t'); // ' bar baz '
	 *
	 * @param {string} value - Value with uncollapsed white-space,
	 *   coerced to string.
	 * @return {string} - Value with collapsed white-space.
	 */
	function collapse(value) {
	  return String(value).replace(/\s+/g, ' ');
	}


/***/ },

/***/ 583:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(584);

/***/ },

/***/ 584:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ReactTestUtils
	 */
	
	'use strict';
	
	var _prodInvariant = __webpack_require__(7),
	    _assign = __webpack_require__(4);
	
	var EventConstants = __webpack_require__(42);
	var EventPluginHub = __webpack_require__(44);
	var EventPluginRegistry = __webpack_require__(45);
	var EventPropagators = __webpack_require__(43);
	var React = __webpack_require__(3);
	var ReactDefaultInjection = __webpack_require__(40);
	var ReactDOM = __webpack_require__(36);
	var ReactDOMComponentTree = __webpack_require__(37);
	var ReactElement = __webpack_require__(9);
	var ReactBrowserEventEmitter = __webpack_require__(109);
	var ReactCompositeComponent = __webpack_require__(124);
	var ReactInstanceMap = __webpack_require__(121);
	var ReactReconciler = __webpack_require__(60);
	var ReactUpdates = __webpack_require__(57);
	var SyntheticEvent = __webpack_require__(54);
	
	var emptyObject = __webpack_require__(19);
	var findDOMNode = __webpack_require__(169);
	var invariant = __webpack_require__(8);
	
	var topLevelTypes = EventConstants.topLevelTypes;
	
	function Event(suffix) {}
	
	/**
	 * @class ReactTestUtils
	 */
	
	function findAllInRenderedTreeInternal(inst, test) {
	  if (!inst || !inst.getPublicInstance) {
	    return [];
	  }
	  var publicInst = inst.getPublicInstance();
	  var ret = test(publicInst) ? [publicInst] : [];
	  var currentElement = inst._currentElement;
	  if (ReactTestUtils.isDOMComponent(publicInst)) {
	    var renderedChildren = inst._renderedChildren;
	    var key;
	    for (key in renderedChildren) {
	      if (!renderedChildren.hasOwnProperty(key)) {
	        continue;
	      }
	      ret = ret.concat(findAllInRenderedTreeInternal(renderedChildren[key], test));
	    }
	  } else if (ReactElement.isValidElement(currentElement) && typeof currentElement.type === 'function') {
	    ret = ret.concat(findAllInRenderedTreeInternal(inst._renderedComponent, test));
	  }
	  return ret;
	}
	
	/**
	 * Utilities for making it easy to test React components.
	 *
	 * See https://facebook.github.io/react/docs/test-utils.html
	 *
	 * Todo: Support the entire DOM.scry query syntax. For now, these simple
	 * utilities will suffice for testing purposes.
	 * @lends ReactTestUtils
	 */
	var ReactTestUtils = {
	  renderIntoDocument: function (instance) {
	    var div = document.createElement('div');
	    // None of our tests actually require attaching the container to the
	    // DOM, and doing so creates a mess that we rely on test isolation to
	    // clean up, so we're going to stop honoring the name of this method
	    // (and probably rename it eventually) if no problems arise.
	    // document.documentElement.appendChild(div);
	    return ReactDOM.render(instance, div);
	  },
	
	  isElement: function (element) {
	    return ReactElement.isValidElement(element);
	  },
	
	  isElementOfType: function (inst, convenienceConstructor) {
	    return ReactElement.isValidElement(inst) && inst.type === convenienceConstructor;
	  },
	
	  isDOMComponent: function (inst) {
	    return !!(inst && inst.nodeType === 1 && inst.tagName);
	  },
	
	  isDOMComponentElement: function (inst) {
	    return !!(inst && ReactElement.isValidElement(inst) && !!inst.tagName);
	  },
	
	  isCompositeComponent: function (inst) {
	    if (ReactTestUtils.isDOMComponent(inst)) {
	      // Accessing inst.setState warns; just return false as that'll be what
	      // this returns when we have DOM nodes as refs directly
	      return false;
	    }
	    return inst != null && typeof inst.render === 'function' && typeof inst.setState === 'function';
	  },
	
	  isCompositeComponentWithType: function (inst, type) {
	    if (!ReactTestUtils.isCompositeComponent(inst)) {
	      return false;
	    }
	    var internalInstance = ReactInstanceMap.get(inst);
	    var constructor = internalInstance._currentElement.type;
	
	    return constructor === type;
	  },
	
	  isCompositeComponentElement: function (inst) {
	    if (!ReactElement.isValidElement(inst)) {
	      return false;
	    }
	    // We check the prototype of the type that will get mounted, not the
	    // instance itself. This is a future proof way of duck typing.
	    var prototype = inst.type.prototype;
	    return typeof prototype.render === 'function' && typeof prototype.setState === 'function';
	  },
	
	  isCompositeComponentElementWithType: function (inst, type) {
	    var internalInstance = ReactInstanceMap.get(inst);
	    var constructor = internalInstance._currentElement.type;
	
	    return !!(ReactTestUtils.isCompositeComponentElement(inst) && constructor === type);
	  },
	
	  getRenderedChildOfCompositeComponent: function (inst) {
	    if (!ReactTestUtils.isCompositeComponent(inst)) {
	      return null;
	    }
	    var internalInstance = ReactInstanceMap.get(inst);
	    return internalInstance._renderedComponent.getPublicInstance();
	  },
	
	  findAllInRenderedTree: function (inst, test) {
	    if (!inst) {
	      return [];
	    }
	    !ReactTestUtils.isCompositeComponent(inst) ? (undefined) !== 'production' ? invariant(false, 'findAllInRenderedTree(...): instance must be a composite component') : _prodInvariant('10') : void 0;
	    return findAllInRenderedTreeInternal(ReactInstanceMap.get(inst), test);
	  },
	
	  /**
	   * Finds all instance of components in the rendered tree that are DOM
	   * components with the class name matching `className`.
	   * @return {array} an array of all the matches.
	   */
	  scryRenderedDOMComponentsWithClass: function (root, classNames) {
	    return ReactTestUtils.findAllInRenderedTree(root, function (inst) {
	      if (ReactTestUtils.isDOMComponent(inst)) {
	        var className = inst.className;
	        if (typeof className !== 'string') {
	          // SVG, probably.
	          className = inst.getAttribute('class') || '';
	        }
	        var classList = className.split(/\s+/);
	
	        if (!Array.isArray(classNames)) {
	          !(classNames !== undefined) ? (undefined) !== 'production' ? invariant(false, 'TestUtils.scryRenderedDOMComponentsWithClass expects a className as a second argument.') : _prodInvariant('11') : void 0;
	          classNames = classNames.split(/\s+/);
	        }
	        return classNames.every(function (name) {
	          return classList.indexOf(name) !== -1;
	        });
	      }
	      return false;
	    });
	  },
	
	  /**
	   * Like scryRenderedDOMComponentsWithClass but expects there to be one result,
	   * and returns that one result, or throws exception if there is any other
	   * number of matches besides one.
	   * @return {!ReactDOMComponent} The one match.
	   */
	  findRenderedDOMComponentWithClass: function (root, className) {
	    var all = ReactTestUtils.scryRenderedDOMComponentsWithClass(root, className);
	    if (all.length !== 1) {
	      throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for class:' + className);
	    }
	    return all[0];
	  },
	
	  /**
	   * Finds all instance of components in the rendered tree that are DOM
	   * components with the tag name matching `tagName`.
	   * @return {array} an array of all the matches.
	   */
	  scryRenderedDOMComponentsWithTag: function (root, tagName) {
	    return ReactTestUtils.findAllInRenderedTree(root, function (inst) {
	      return ReactTestUtils.isDOMComponent(inst) && inst.tagName.toUpperCase() === tagName.toUpperCase();
	    });
	  },
	
	  /**
	   * Like scryRenderedDOMComponentsWithTag but expects there to be one result,
	   * and returns that one result, or throws exception if there is any other
	   * number of matches besides one.
	   * @return {!ReactDOMComponent} The one match.
	   */
	  findRenderedDOMComponentWithTag: function (root, tagName) {
	    var all = ReactTestUtils.scryRenderedDOMComponentsWithTag(root, tagName);
	    if (all.length !== 1) {
	      throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for tag:' + tagName);
	    }
	    return all[0];
	  },
	
	  /**
	   * Finds all instances of components with type equal to `componentType`.
	   * @return {array} an array of all the matches.
	   */
	  scryRenderedComponentsWithType: function (root, componentType) {
	    return ReactTestUtils.findAllInRenderedTree(root, function (inst) {
	      return ReactTestUtils.isCompositeComponentWithType(inst, componentType);
	    });
	  },
	
	  /**
	   * Same as `scryRenderedComponentsWithType` but expects there to be one result
	   * and returns that one result, or throws exception if there is any other
	   * number of matches besides one.
	   * @return {!ReactComponent} The one match.
	   */
	  findRenderedComponentWithType: function (root, componentType) {
	    var all = ReactTestUtils.scryRenderedComponentsWithType(root, componentType);
	    if (all.length !== 1) {
	      throw new Error('Did not find exactly one match (found: ' + all.length + ') ' + 'for componentType:' + componentType);
	    }
	    return all[0];
	  },
	
	  /**
	   * Pass a mocked component module to this method to augment it with
	   * useful methods that allow it to be used as a dummy React component.
	   * Instead of rendering as usual, the component will become a simple
	   * <div> containing any provided children.
	   *
	   * @param {object} module the mock function object exported from a
	   *                        module that defines the component to be mocked
	   * @param {?string} mockTagName optional dummy root tag name to return
	   *                              from render method (overrides
	   *                              module.mockTagName if provided)
	   * @return {object} the ReactTestUtils object (for chaining)
	   */
	  mockComponent: function (module, mockTagName) {
	    mockTagName = mockTagName || module.mockTagName || 'div';
	
	    module.prototype.render.mockImplementation(function () {
	      return React.createElement(mockTagName, null, this.props.children);
	    });
	
	    return this;
	  },
	
	  /**
	   * Simulates a top level event being dispatched from a raw event that occurred
	   * on an `Element` node.
	   * @param {Object} topLevelType A type from `EventConstants.topLevelTypes`
	   * @param {!Element} node The dom to simulate an event occurring on.
	   * @param {?Event} fakeNativeEvent Fake native event to use in SyntheticEvent.
	   */
	  simulateNativeEventOnNode: function (topLevelType, node, fakeNativeEvent) {
	    fakeNativeEvent.target = node;
	    ReactBrowserEventEmitter.ReactEventListener.dispatchEvent(topLevelType, fakeNativeEvent);
	  },
	
	  /**
	   * Simulates a top level event being dispatched from a raw event that occurred
	   * on the `ReactDOMComponent` `comp`.
	   * @param {Object} topLevelType A type from `EventConstants.topLevelTypes`.
	   * @param {!ReactDOMComponent} comp
	   * @param {?Event} fakeNativeEvent Fake native event to use in SyntheticEvent.
	   */
	  simulateNativeEventOnDOMComponent: function (topLevelType, comp, fakeNativeEvent) {
	    ReactTestUtils.simulateNativeEventOnNode(topLevelType, findDOMNode(comp), fakeNativeEvent);
	  },
	
	  nativeTouchData: function (x, y) {
	    return {
	      touches: [{ pageX: x, pageY: y }]
	    };
	  },
	
	  createRenderer: function () {
	    return new ReactShallowRenderer();
	  },
	
	  Simulate: null,
	  SimulateNative: {}
	};
	
	/**
	 * @class ReactShallowRenderer
	 */
	var ReactShallowRenderer = function () {
	  this._instance = null;
	};
	
	ReactShallowRenderer.prototype.getMountedInstance = function () {
	  return this._instance ? this._instance._instance : null;
	};
	
	var nextDebugID = 1;
	
	var NoopInternalComponent = function (element) {
	  this._renderedOutput = element;
	  this._currentElement = element;
	
	  if ((undefined) !== 'production') {
	    this._debugID = nextDebugID++;
	  }
	};
	
	NoopInternalComponent.prototype = {
	
	  mountComponent: function () {},
	
	  receiveComponent: function (element) {
	    this._renderedOutput = element;
	    this._currentElement = element;
	  },
	
	  getHostNode: function () {
	    return undefined;
	  },
	
	  unmountComponent: function () {},
	
	  getPublicInstance: function () {
	    return null;
	  }
	};
	
	var ShallowComponentWrapper = function (element) {
	  // TODO: Consolidate with instantiateReactComponent
	  if ((undefined) !== 'production') {
	    this._debugID = nextDebugID++;
	  }
	
	  this.construct(element);
	};
	_assign(ShallowComponentWrapper.prototype, ReactCompositeComponent.Mixin, {
	  _constructComponent: ReactCompositeComponent.Mixin._constructComponentWithoutOwner,
	  _instantiateReactComponent: function (element) {
	    return new NoopInternalComponent(element);
	  },
	  _replaceNodeWithMarkup: function () {},
	  _renderValidatedComponent: ReactCompositeComponent.Mixin._renderValidatedComponentWithoutOwnerOrContext
	});
	
	ReactShallowRenderer.prototype.render = function (element, context) {
	  // Ensure we've done the default injections. This might not be true in the
	  // case of a simple test that only requires React and the TestUtils in
	  // conjunction with an inline-requires transform.
	  ReactDefaultInjection.inject();
	
	  !ReactElement.isValidElement(element) ? (undefined) !== 'production' ? invariant(false, 'ReactShallowRenderer render(): Invalid component element.%s', typeof element === 'function' ? ' Instead of passing a component class, make sure to instantiate ' + 'it by passing it to React.createElement.' : '') : _prodInvariant('12', typeof element === 'function' ? ' Instead of passing a component class, make sure to instantiate ' + 'it by passing it to React.createElement.' : '') : void 0;
	  !(typeof element.type !== 'string') ? (undefined) !== 'production' ? invariant(false, 'ReactShallowRenderer render(): Shallow rendering works only with custom components, not primitives (%s). Instead of calling `.render(el)` and inspecting the rendered output, look at `el.props` directly instead.', element.type) : _prodInvariant('13', element.type) : void 0;
	
	  if (!context) {
	    context = emptyObject;
	  }
	  ReactUpdates.batchedUpdates(_batchedRender, this, element, context);
	
	  return this.getRenderOutput();
	};
	
	function _batchedRender(renderer, element, context) {
	  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(true);
	  renderer._render(element, transaction, context);
	  ReactUpdates.ReactReconcileTransaction.release(transaction);
	}
	
	ReactShallowRenderer.prototype.getRenderOutput = function () {
	  return this._instance && this._instance._renderedComponent && this._instance._renderedComponent._renderedOutput || null;
	};
	
	ReactShallowRenderer.prototype.unmount = function () {
	  if (this._instance) {
	    ReactReconciler.unmountComponent(this._instance, false);
	  }
	};
	
	ReactShallowRenderer.prototype._render = function (element, transaction, context) {
	  if (this._instance) {
	    ReactReconciler.receiveComponent(this._instance, element, transaction, context);
	  } else {
	    var instance = new ShallowComponentWrapper(element);
	    ReactReconciler.mountComponent(instance, transaction, null, null, context, 0);
	    this._instance = instance;
	  }
	};
	
	/**
	 * Exports:
	 *
	 * - `ReactTestUtils.Simulate.click(Element/ReactDOMComponent)`
	 * - `ReactTestUtils.Simulate.mouseMove(Element/ReactDOMComponent)`
	 * - `ReactTestUtils.Simulate.change(Element/ReactDOMComponent)`
	 * - ... (All keys from event plugin `eventTypes` objects)
	 */
	function makeSimulator(eventType) {
	  return function (domComponentOrNode, eventData) {
	    var node;
	    !!React.isValidElement(domComponentOrNode) ? (undefined) !== 'production' ? invariant(false, 'TestUtils.Simulate expects a component instance and not a ReactElement.TestUtils.Simulate will not work if you are using shallow rendering.') : _prodInvariant('14') : void 0;
	    if (ReactTestUtils.isDOMComponent(domComponentOrNode)) {
	      node = findDOMNode(domComponentOrNode);
	    } else if (domComponentOrNode.tagName) {
	      node = domComponentOrNode;
	    }
	
	    var dispatchConfig = EventPluginRegistry.eventNameDispatchConfigs[eventType];
	
	    var fakeNativeEvent = new Event();
	    fakeNativeEvent.target = node;
	    fakeNativeEvent.type = eventType.toLowerCase();
	
	    // We don't use SyntheticEvent.getPooled in order to not have to worry about
	    // properly destroying any properties assigned from `eventData` upon release
	    var event = new SyntheticEvent(dispatchConfig, ReactDOMComponentTree.getInstanceFromNode(node), fakeNativeEvent, node);
	    // Since we aren't using pooling, always persist the event. This will make
	    // sure it's marked and won't warn when setting additional properties.
	    event.persist();
	    _assign(event, eventData);
	
	    if (dispatchConfig.phasedRegistrationNames) {
	      EventPropagators.accumulateTwoPhaseDispatches(event);
	    } else {
	      EventPropagators.accumulateDirectDispatches(event);
	    }
	
	    ReactUpdates.batchedUpdates(function () {
	      EventPluginHub.enqueueEvents(event);
	      EventPluginHub.processEventQueue(true);
	    });
	  };
	}
	
	function buildSimulators() {
	  ReactTestUtils.Simulate = {};
	
	  var eventType;
	  for (eventType in EventPluginRegistry.eventNameDispatchConfigs) {
	    /**
	     * @param {!Element|ReactDOMComponent} domComponentOrNode
	     * @param {?object} eventData Fake event data to use in SyntheticEvent.
	     */
	    ReactTestUtils.Simulate[eventType] = makeSimulator(eventType);
	  }
	}
	
	// Rebuild ReactTestUtils.Simulate whenever event plugins are injected
	var oldInjectEventPluginOrder = EventPluginHub.injection.injectEventPluginOrder;
	EventPluginHub.injection.injectEventPluginOrder = function () {
	  oldInjectEventPluginOrder.apply(this, arguments);
	  buildSimulators();
	};
	var oldInjectEventPlugins = EventPluginHub.injection.injectEventPluginsByName;
	EventPluginHub.injection.injectEventPluginsByName = function () {
	  oldInjectEventPlugins.apply(this, arguments);
	  buildSimulators();
	};
	
	buildSimulators();
	
	/**
	 * Exports:
	 *
	 * - `ReactTestUtils.SimulateNative.click(Element/ReactDOMComponent)`
	 * - `ReactTestUtils.SimulateNative.mouseMove(Element/ReactDOMComponent)`
	 * - `ReactTestUtils.SimulateNative.mouseIn/ReactDOMComponent)`
	 * - `ReactTestUtils.SimulateNative.mouseOut(Element/ReactDOMComponent)`
	 * - ... (All keys from `EventConstants.topLevelTypes`)
	 *
	 * Note: Top level event types are a subset of the entire set of handler types
	 * (which include a broader set of "synthetic" events). For example, onDragDone
	 * is a synthetic event. Except when testing an event plugin or React's event
	 * handling code specifically, you probably want to use ReactTestUtils.Simulate
	 * to dispatch synthetic events.
	 */
	
	function makeNativeSimulator(eventType) {
	  return function (domComponentOrNode, nativeEventData) {
	    var fakeNativeEvent = new Event(eventType);
	    _assign(fakeNativeEvent, nativeEventData);
	    if (ReactTestUtils.isDOMComponent(domComponentOrNode)) {
	      ReactTestUtils.simulateNativeEventOnDOMComponent(eventType, domComponentOrNode, fakeNativeEvent);
	    } else if (domComponentOrNode.tagName) {
	      // Will allow on actual dom nodes.
	      ReactTestUtils.simulateNativeEventOnNode(eventType, domComponentOrNode, fakeNativeEvent);
	    }
	  };
	}
	
	Object.keys(topLevelTypes).forEach(function (eventType) {
	  // Event type is stored as 'topClick' - we transform that to 'click'
	  var convenienceName = eventType.indexOf('top') === 0 ? eventType.charAt(3).toLowerCase() + eventType.substr(4) : eventType;
	  /**
	   * @param {!Element|ReactDOMComponent} domComponentOrNode
	   * @param {?Event} nativeEventData Fake native event to use in SyntheticEvent.
	   */
	  ReactTestUtils.SimulateNative[convenienceName] = makeNativeSimulator(eventType);
	});
	
	module.exports = ReactTestUtils;

/***/ },

/***/ 585:
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */
	
	'use strict';
	
	var isObject = __webpack_require__(586);
	
	function isObjectObject(o) {
	  return isObject(o) === true
	    && Object.prototype.toString.call(o) === '[object Object]';
	}
	
	module.exports = function isPlainObject(o) {
	  var ctor,prot;
	  
	  if (isObjectObject(o) === false) return false;
	  
	  // If has modified constructor
	  ctor = o.constructor;
	  if (typeof ctor !== 'function') return false;
	  
	  // If has modified prototype
	  prot = ctor.prototype;
	  if (isObjectObject(prot) === false) return false;
	  
	  // If constructor does not have an Object-specific method
	  if (prot.hasOwnProperty('isPrototypeOf') === false) {
	    return false;
	  }
	  
	  // Most likely a plain Object
	  return true;
	};


/***/ },

/***/ 586:
/***/ function(module, exports) {

	/*!
	 * isobject <https://github.com/jonschlinkert/isobject>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */
	
	'use strict';
	
	module.exports = function isObject(val) {
	  return val != null && typeof val === 'object'
	    && !Array.isArray(val);
	};


/***/ },

/***/ 587:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var isRegexp = __webpack_require__(588);
	var isPlainObj = __webpack_require__(589);
	
	module.exports = function (val, opts, pad) {
		var seen = [];
	
		return (function stringify(val, opts, pad) {
			opts = opts || {};
			opts.indent = opts.indent || '\t';
			pad = pad || '';
			var tokens;
			if(opts.inlineCharacterLimit == void 0) {
				tokens = {
					newLine: '\n',
					newLineOrSpace: '\n',
					pad: pad,
					indent: pad + opts.indent
				};
			} else {
				tokens = {
					newLine: '@@__STRINGIFY_OBJECT_NEW_LINE__@@',
					newLineOrSpace: '@@__STRINGIFY_OBJECT_NEW_LINE_OR_SPACE__@@',
					pad: '@@__STRINGIFY_OBJECT_PAD__@@',
					indent: '@@__STRINGIFY_OBJECT_INDENT__@@'
				}
			}
			var expandWhiteSpace = function(string) {
				if (opts.inlineCharacterLimit == void 0) { return string; }
				var oneLined = string.
					replace(new RegExp(tokens.newLine, 'g'), '').
					replace(new RegExp(tokens.newLineOrSpace, 'g'), ' ').
					replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');
	
				if(oneLined.length <= opts.inlineCharacterLimit) {
					return oneLined;
				} else {
					return string.
						replace(new RegExp(tokens.newLine + '|' + tokens.newLineOrSpace, 'g'), '\n').
						replace(new RegExp(tokens.pad, 'g'), pad).
						replace(new RegExp(tokens.indent, 'g'), pad + opts.indent);
				}
			};
	
			if (seen.indexOf(val) !== -1) {
				return '"[Circular]"';
			}
	
			if (val === null ||
				val === undefined ||
				typeof val === 'number' ||
				typeof val === 'boolean' ||
				typeof val === 'function' ||
				isRegexp(val)) {
				return String(val);
			}
	
			if (val instanceof Date) {
				return 'new Date(\'' + val.toISOString() + '\')';
			}
	
			if (Array.isArray(val)) {
				if (val.length === 0) {
					return '[]';
				}
	
				seen.push(val);
	
				var ret = '[' + tokens.newLine + val.map(function (el, i) {
					var eol = val.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
					return tokens.indent + stringify(el, opts, pad + opts.indent) + eol;
				}).join('') + tokens.pad + ']';
	
				seen.pop(val);
	
				return expandWhiteSpace(ret);
			}
	
			if (isPlainObj(val)) {
				var objKeys = Object.keys(val);
	
				if (objKeys.length === 0) {
					return '{}';
				}
	
				seen.push(val);
	
				var ret = '{' + tokens.newLine + objKeys.map(function (el, i) {
					if (opts.filter && !opts.filter(val, el)) {
						return '';
					}
	
					var eol = objKeys.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
					var key = /^[a-z$_][a-z$_0-9]*$/i.test(el) ? el : stringify(el, opts);
					return tokens.indent + key + ': ' + stringify(val[el], opts, pad + opts.indent) + eol;
				}).join('') + tokens.pad + '}';
	
				seen.pop(val);
	
				return expandWhiteSpace(ret);
			}
	
			val = String(val).replace(/[\r\n]/g, function (x) {
				return x === '\n' ? '\\n' : '\\r';
			});
	
			if (opts.singleQuotes === false) {
				return '"' + val.replace(/"/g, '\\\"') + '"';
			}
	
			return '\'' + val.replace(/'/g, '\\\'') + '\'';
		})(val, opts, pad);
	};


/***/ },

/***/ 588:
/***/ function(module, exports) {

	'use strict';
	module.exports = function (re) {
		return Object.prototype.toString.call(re) === '[object RegExp]';
	};


/***/ },

/***/ 589:
/***/ function(module, exports) {

	'use strict';
	var toString = Object.prototype.toString;
	
	module.exports = function (x) {
		var prototype;
		return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
	};


/***/ },

/***/ 590:
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	module.exports = function sortObject(obj, comparator) {
		// Arrays
		if (Array.isArray(obj)) {
			var result = [];
			for (var i = 0; i < obj.length; ++i) {
				// Fetch
				var value = obj[i];
	
				// Recurse if object or array
				if (value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
					value = sortObject(value, comparator);
				}
	
				// Push
				result.push(value);
			}
			return result;
		}
	
		// Objects
		else {
				var _result = {};
				var sortedKeys = Object.keys(obj).sort(comparator);
				for (var _i = 0; _i < sortedKeys.length; ++_i) {
					// Fetch
					var key = sortedKeys[_i];
					var _value = obj[key];
	
					// Recurse if object or array
					if (_value != null && (typeof _value === 'undefined' ? 'undefined' : _typeof(_value)) === 'object') {
						_value = sortObject(_value, comparator);
					}
	
					// Push
					_result[key] = _value;
				}
				return _result;
			}
	};

/***/ },

/***/ 591:
/***/ function(module, exports) {

	var traverse = module.exports = function (obj) {
	    return new Traverse(obj);
	};
	
	function Traverse (obj) {
	    this.value = obj;
	}
	
	Traverse.prototype.get = function (ps) {
	    var node = this.value;
	    for (var i = 0; i < ps.length; i ++) {
	        var key = ps[i];
	        if (!node || !hasOwnProperty.call(node, key)) {
	            node = undefined;
	            break;
	        }
	        node = node[key];
	    }
	    return node;
	};
	
	Traverse.prototype.has = function (ps) {
	    var node = this.value;
	    for (var i = 0; i < ps.length; i ++) {
	        var key = ps[i];
	        if (!node || !hasOwnProperty.call(node, key)) {
	            return false;
	        }
	        node = node[key];
	    }
	    return true;
	};
	
	Traverse.prototype.set = function (ps, value) {
	    var node = this.value;
	    for (var i = 0; i < ps.length - 1; i ++) {
	        var key = ps[i];
	        if (!hasOwnProperty.call(node, key)) node[key] = {};
	        node = node[key];
	    }
	    node[ps[i]] = value;
	    return value;
	};
	
	Traverse.prototype.map = function (cb) {
	    return walk(this.value, cb, true);
	};
	
	Traverse.prototype.forEach = function (cb) {
	    this.value = walk(this.value, cb, false);
	    return this.value;
	};
	
	Traverse.prototype.reduce = function (cb, init) {
	    var skip = arguments.length === 1;
	    var acc = skip ? this.value : init;
	    this.forEach(function (x) {
	        if (!this.isRoot || !skip) {
	            acc = cb.call(this, acc, x);
	        }
	    });
	    return acc;
	};
	
	Traverse.prototype.paths = function () {
	    var acc = [];
	    this.forEach(function (x) {
	        acc.push(this.path); 
	    });
	    return acc;
	};
	
	Traverse.prototype.nodes = function () {
	    var acc = [];
	    this.forEach(function (x) {
	        acc.push(this.node);
	    });
	    return acc;
	};
	
	Traverse.prototype.clone = function () {
	    var parents = [], nodes = [];
	    
	    return (function clone (src) {
	        for (var i = 0; i < parents.length; i++) {
	            if (parents[i] === src) {
	                return nodes[i];
	            }
	        }
	        
	        if (typeof src === 'object' && src !== null) {
	            var dst = copy(src);
	            
	            parents.push(src);
	            nodes.push(dst);
	            
	            forEach(objectKeys(src), function (key) {
	                dst[key] = clone(src[key]);
	            });
	            
	            parents.pop();
	            nodes.pop();
	            return dst;
	        }
	        else {
	            return src;
	        }
	    })(this.value);
	};
	
	function walk (root, cb, immutable) {
	    var path = [];
	    var parents = [];
	    var alive = true;
	    
	    return (function walker (node_) {
	        var node = immutable ? copy(node_) : node_;
	        var modifiers = {};
	        
	        var keepGoing = true;
	        
	        var state = {
	            node : node,
	            node_ : node_,
	            path : [].concat(path),
	            parent : parents[parents.length - 1],
	            parents : parents,
	            key : path.slice(-1)[0],
	            isRoot : path.length === 0,
	            level : path.length,
	            circular : null,
	            update : function (x, stopHere) {
	                if (!state.isRoot) {
	                    state.parent.node[state.key] = x;
	                }
	                state.node = x;
	                if (stopHere) keepGoing = false;
	            },
	            'delete' : function (stopHere) {
	                delete state.parent.node[state.key];
	                if (stopHere) keepGoing = false;
	            },
	            remove : function (stopHere) {
	                if (isArray(state.parent.node)) {
	                    state.parent.node.splice(state.key, 1);
	                }
	                else {
	                    delete state.parent.node[state.key];
	                }
	                if (stopHere) keepGoing = false;
	            },
	            keys : null,
	            before : function (f) { modifiers.before = f },
	            after : function (f) { modifiers.after = f },
	            pre : function (f) { modifiers.pre = f },
	            post : function (f) { modifiers.post = f },
	            stop : function () { alive = false },
	            block : function () { keepGoing = false }
	        };
	        
	        if (!alive) return state;
	        
	        function updateState() {
	            if (typeof state.node === 'object' && state.node !== null) {
	                if (!state.keys || state.node_ !== state.node) {
	                    state.keys = objectKeys(state.node)
	                }
	                
	                state.isLeaf = state.keys.length == 0;
	                
	                for (var i = 0; i < parents.length; i++) {
	                    if (parents[i].node_ === node_) {
	                        state.circular = parents[i];
	                        break;
	                    }
	                }
	            }
	            else {
	                state.isLeaf = true;
	                state.keys = null;
	            }
	            
	            state.notLeaf = !state.isLeaf;
	            state.notRoot = !state.isRoot;
	        }
	        
	        updateState();
	        
	        // use return values to update if defined
	        var ret = cb.call(state, state.node);
	        if (ret !== undefined && state.update) state.update(ret);
	        
	        if (modifiers.before) modifiers.before.call(state, state.node);
	        
	        if (!keepGoing) return state;
	        
	        if (typeof state.node == 'object'
	        && state.node !== null && !state.circular) {
	            parents.push(state);
	            
	            updateState();
	            
	            forEach(state.keys, function (key, i) {
	                path.push(key);
	                
	                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
	                
	                var child = walker(state.node[key]);
	                if (immutable && hasOwnProperty.call(state.node, key)) {
	                    state.node[key] = child.node;
	                }
	                
	                child.isLast = i == state.keys.length - 1;
	                child.isFirst = i == 0;
	                
	                if (modifiers.post) modifiers.post.call(state, child);
	                
	                path.pop();
	            });
	            parents.pop();
	        }
	        
	        if (modifiers.after) modifiers.after.call(state, state.node);
	        
	        return state;
	    })(root).node;
	}
	
	function copy (src) {
	    if (typeof src === 'object' && src !== null) {
	        var dst;
	        
	        if (isArray(src)) {
	            dst = [];
	        }
	        else if (isDate(src)) {
	            dst = new Date(src.getTime ? src.getTime() : src);
	        }
	        else if (isRegExp(src)) {
	            dst = new RegExp(src);
	        }
	        else if (isError(src)) {
	            dst = { message: src.message };
	        }
	        else if (isBoolean(src)) {
	            dst = new Boolean(src);
	        }
	        else if (isNumber(src)) {
	            dst = new Number(src);
	        }
	        else if (isString(src)) {
	            dst = new String(src);
	        }
	        else if (Object.create && Object.getPrototypeOf) {
	            dst = Object.create(Object.getPrototypeOf(src));
	        }
	        else if (src.constructor === Object) {
	            dst = {};
	        }
	        else {
	            var proto =
	                (src.constructor && src.constructor.prototype)
	                || src.__proto__
	                || {}
	            ;
	            var T = function () {};
	            T.prototype = proto;
	            dst = new T;
	        }
	        
	        forEach(objectKeys(src), function (key) {
	            dst[key] = src[key];
	        });
	        return dst;
	    }
	    else return src;
	}
	
	var objectKeys = Object.keys || function keys (obj) {
	    var res = [];
	    for (var key in obj) res.push(key)
	    return res;
	};
	
	function toS (obj) { return Object.prototype.toString.call(obj) }
	function isDate (obj) { return toS(obj) === '[object Date]' }
	function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
	function isError (obj) { return toS(obj) === '[object Error]' }
	function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
	function isNumber (obj) { return toS(obj) === '[object Number]' }
	function isString (obj) { return toS(obj) === '[object String]' }
	
	var isArray = Array.isArray || function isArray (xs) {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	};
	
	var forEach = function (xs, fn) {
	    if (xs.forEach) return xs.forEach(fn)
	    else for (var i = 0; i < xs.length; i++) {
	        fn(xs[i], i, xs);
	    }
	};
	
	forEach(objectKeys(Traverse.prototype), function (key) {
	    traverse[key] = function (obj) {
	        var args = [].slice.call(arguments, 1);
	        var t = new Traverse(obj);
	        return t[key].apply(t, args);
	    };
	});
	
	var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
	    return key in obj;
	};


/***/ },

/***/ 592:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _ramda = __webpack_require__(307);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (dictionary) {
	  var node = function node(_ref, index) {
	    var type = _ref.type;
	    var props = _ref.props;
	    var children = _ref.children;
	
	    if (dictionary[type]) {
	      var Type = dictionary[type];
	      return _react2.default.createElement(
	        Type,
	        _extends({ key: index }, props),
	        children && (0, _ramda.values)((0, _ramda.mapObjIndexed)(node, children))
	      );
	    }
	
	    if (type === 'text') {
	      return props.content;
	    }
	  };
	
	  return node;
	};

/***/ },

/***/ 593:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.node = exports.selectedPath = exports.expandSelected = undefined;
	
	var _ramda = __webpack_require__(307);
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var expandSelected = exports.expandSelected = (0, _ramda.reduce)(function (a, x) {
	  return [].concat(_toConsumableArray(a), ['children', x]);
	}, []);
	
	var selectedPath = exports.selectedPath = (0, _ramda.compose)(_ramda.lensPath, expandSelected);
	
	var node = exports.node = function node(path, tree) {
	  return (0, _ramda.view)(selectedPath(path), tree);
	};

/***/ },

/***/ 594:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin
	module.exports = {"App_TreeView":"app-App_TreeView-26uYC","App_ReactTree":"app-App_ReactTree-21Ubv","App_Edit":"app-App_Edit-3dXDd","App_Code":"app-App_Code-3RURt"};

/***/ },

/***/ 595:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _flyd = __webpack_require__(178);
	
	exports.default = function (push, states) {
	  if (window.localStorage.getItem('skiss.selected')) {
	    push({
	      type: 'save/LOAD',
	      payload: {
	        add: JSON.parse(window.localStorage.getItem('skiss.add')),
	        selected: JSON.parse(window.localStorage.getItem('skiss.selected')),
	        tree: JSON.parse(window.localStorage.getItem('skiss.tree'))
	      }
	    });
	  }
	
	  (0, _flyd.on)(function (state) {
	    window.localStorage.setItem('skiss.selected', JSON.stringify(state.selected));
	    window.localStorage.setItem('skiss.add', JSON.stringify(state.add));
	    window.localStorage.setItem('skiss.tree', JSON.stringify(state.tree));
	  }, states);
	};

/***/ },

/***/ 596:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.reducer = exports.initialState = undefined;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _ramda = __webpack_require__(307);
	
	var _selectors = __webpack_require__(593);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var initialState = exports.initialState = {
	  selected: [],
	  add: {
	    type: 'FlatButton',
	    props: {
	      primary: true,
	      label: 'Epic'
	    }
	  },
	
	  tree: {
	    type: 'main',
	    props: {
	      style: {
	        padding: '20px'
	      }
	    },
	
	    children: {
	      '0': {
	        type: 'div',
	        children: {
	          '0': {
	            type: 'text',
	            props: {
	              content: 'Text node'
	            }
	          },
	          '1': {
	            type: 'a',
	            props: {
	              href: 'http://google.com'
	            },
	            children: {
	              '0': {
	                type: 'text',
	                props: {
	                  content: 'All'
	                }
	              }
	            }
	          }
	        }
	      },
	
	      '1': {
	        type: 'RaisedButton',
	        props: {
	          label: 'Such Button, wow',
	          primary: true
	        }
	      }
	    }
	  }
	};
	
	var reducer = exports.reducer = function reducer(state, action) {
	  var currentNode = (0, _selectors.node)(state.selected, state.tree);
	
	  switch (action.type) {
	    case 'selection/UPDATE':
	      return _extends({}, state, {
	        selected: action.payload
	      });
	
	    case 'edit/UPDATE':
	
	      return _extends({}, state, {
	        tree: (0, _ramda.set)((0, _selectors.selectedPath)(state.selected), _extends({}, currentNode, {
	          props: _extends({}, currentNode.props, action.payload)
	        }), state.tree)
	      });
	
	    case 'add/UPDATE_TYPE':
	      // NOTE: It could also keep a "cache" of props set for a component type
	      return _extends({}, state, {
	        add: {
	          type: action.payload,
	          props: {}
	        }
	      });
	
	    case 'add/UPDATE_PROP':
	      return _extends({}, state, {
	        add: _extends({}, state.add, {
	          props: _extends({}, state.add.props, action.payload)
	        })
	      });
	
	    case 'add/NEW_CHILD':
	      return _extends({}, state, {
	        tree: (0, _ramda.set)((0, _selectors.selectedPath)(state.selected), _extends({}, currentNode, {
	          children: currentNode.children ? _extends({}, currentNode.children, _defineProperty({}, '' + (0, _ramda.keys)(currentNode.children).length, state.add)) : {
	            '0': state.add
	          }
	        }), state.tree)
	      });
	
	    case 'save/LOAD':
	      return _extends({}, state, action.payload);
	
	    default:
	      return state;
	  }
	};

/***/ }

});
//# sourceMappingURL=index-b857f9b5d4e8bcdf270d.js.map