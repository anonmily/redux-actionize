'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = ActionCreator;

var _simplyIs = require('simply-is');

var _simplyIs2 = _interopRequireDefault(_simplyIs);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * ActionCreator
 *
 * @param {string} name - name of the action
 *
 * @param {function} action_creator - A function of form: function(params){ return { ... } } (Do not include the "type" parameter, it will be added automatically) 
 *
 */
function ActionCreator(name, action_creator) {
	return function () {
		var args = Array.prototype.slice.call(arguments);

		if (!action_creator) {

			action_creator = function action_creator() {
				return {};
			};
		} else if (_simplyIs2.default.not.function(action_creator)) {

			console.error(action_creator);
			throw new TypeError('ActionCreator: action_creator is not a function');
		}

		var action_data = action_creator.apply(this, args);
		if (!action_data || _simplyIs2.default.not.object(action_data)) {

			console.error(action_data);
			throw new TypeError('ActionCreator : ' + name + ' : Result of action_creator with arguments=' + args.join(',') + ' is not an object.');
		}

		action_data.type = name;
		return action_data;
	};
}