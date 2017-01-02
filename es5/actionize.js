'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _simplyIs = require('simply-is');

var _simplyIs2 = _interopRequireDefault(_simplyIs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

var _action_creator = require('./action_creator');

var _action_creator2 = _interopRequireDefault(_action_creator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 *	Redux Actions
 *		- action names are NOT case sensitive. Action names passed in are all converted to lowercase. Thus, registering an action with name='LOGIN', name='login', or name='Login' is the same: they will all to the same action/reducer name: 'login'
 *
 *	@param {object} initial_state - the initial state to iniialize this mountpoint with
 *	@param {object} options - extra options to configure the reaction
 *		{string} namespace
 * 		{string} type (CAMELCASE (default) | UNDERSCORE)
 *		{boolean} debug
 */
var Reaction = function Reaction() {
	var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	_classCallCheck(this, Reaction);

	_initialiseProps.call(this);

	this._namespace = config.namespace || false;
	this.initial_state = config.initialState || config.initial_state || {};
	this.debug = config.debug || false;
	this._type = config.type || "CAMELCASE";
	this.reducers = {};
	this.actions = {};
}; // end Reaction class

var _initialiseProps = function _initialiseProps() {
	var _this = this;

	this.get_action_name = function (action) {
		var global = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

		var namespace = _this._namespace,
		    is_camelcase = _this._type === "CAMELCASE";
		if (!namespace || !!global) {
			namespace = "global";
		}
		if (is_camelcase) {
			return _lodash2.default.camelCase(_lodash2.default.camelCase(namespace) + " " + action);
		} else {
			return (0, _utils.to_underscore)(namespace) + "_" + (0, _utils.to_underscore)(action);
		}
	};

	this.getActionName = this.get_action_name;

	this.type = function (name_type) {
		_this._type = (0, _utils.upper)(name_type);
		return _this;
	};

	this.setType = this.type;
	this.set_type = this.type;

	this.namespace = function (namespace) {
		_this._namespace = namespace;
		return _this;
	};

	this.setNamespace = this.namespace;
	this.set_namespace = this.namespace;

	this.register = function (config) {
		var action = config.action,
		    creator = config.creator,
		    reducer = config.reducer,
		    global = config.global;

		var action_name = _this.get_action_name(action, global),
		    clean_action_name = _this._type === "CAMELCASE" ? _lodash2.default.camelCase(action) : (0, _utils.to_underscore)(action);
		_this.actions[clean_action_name] = (0, _action_creator2.default)(action_name, creator);
		_this.reducers[action_name] = reducer;
		return _this;
	};

	this.reducer = function () {
		var initial_state = _this.initial_state,
		    reducers = _this.reducers,
		    mountpoint = _this.mountpoint;

		return function () {
			var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initial_state;
			var action = arguments[1];

			var current_reducer = reducers[action.type];
			if (current_reducer) {
				return current_reducer(state, action);
			} else {
				return state;
			}
		};
	};

	this.get_reducer = this.reducer;
	this.getReducer = this.reducer;

	this.get_actions = function (dispatch) {
		var actions = _this.actions,
		    debug = _this.debug,
		    mountpoint = _this.mountpoint,
		    type = _this.type;

		var wrapped_actions = {};
		Object.keys(actions).forEach(function (action) {
			wrapped_actions[action] = function () {

				if (debug) {
					console.log('---------');
					console.log('Executing Action: ' + action);
					console.log(arguments);
				}
				dispatch(actions[action].apply(this, arguments));
			};
		});
		return wrapped_actions;
	};

	this.getActions = this.get_actions;
};

var ReduxActionize = function ReduxActionize(initial_state) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	return new Reaction({
		initial_state: initial_state,
		namespace: options.namespace,
		type: options.type,
		debug: options.debug
	});
};
exports.default = ReduxActionize;