import is from 'simply-is'
import _ from 'lodash'

import { upper, lower, to_underscore } from './utils'
import ActionCreator from './action_creator'

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
class Reaction{
 	constructor(config={}){
 		this._namespace = config.namespace || false
 		this.initial_state = config.initialState || config.initial_state || {}
 		this.debug = config.debug || false
 		this._type = config.type || "CAMELCASE"
 		this.reducers = {}
 		this.actions = {}
 	}
 	
 	get_action_name = (action, global=false) => {
 		var namespace = this._namespace,
 			is_camelcase = this._type === "CAMELCASE"
 		if(!namespace || !!global){
 			namespace = "global"
 		}
		if( is_camelcase ){
			return _.camelCase(_.camelCase(namespace) + " " + action)
		}else{
			return to_underscore(namespace) + "_" + to_underscore(action)
		}
 	};
 	getActionName = this.get_action_name;

 	type = (name_type) => {
 		this._type = upper(name_type)
 		return this
 	};
 	setType = this.type;
 	set_type = this.type;

 	namespace = (namespace) => {
 		this._namespace = namespace
 		return this
 	};
 	setNamespace = this.namespace;
 	set_namespace = this.namespace;

 	register = (config) => {
 		var { action, creator, reducer, global } = config
		var action_name = this.get_action_name(action, global),
			clean_action_name = this._type === "CAMELCASE" ? _.camelCase(action) : to_underscore(action)
		this.actions[ clean_action_name ] = ActionCreator(action_name, creator)
		this.reducers[ action_name ]	=  reducer
		return this
 	};

 	reducer = () => {
		var { initial_state, reducers, mountpoint } = this
		return function(state=initial_state, action){
			let current_reducer = reducers[action.type]
			if( current_reducer ){
				return current_reducer(state, action)
			}else{
				return state
			}
		}
	};
	get_reducer = this.reducer;
	getReducer = this.reducer;

	get_actions = (dispatch) => {
		var { actions, debug, mountpoint, type } = this
		var wrapped_actions = {}
		Object.keys(actions).forEach( action => {
			wrapped_actions[action] = function(){

				if( debug ){
					console.log('---------')
					console.log('Executing Action: ' + action)
					console.log(arguments)
				}
				dispatch( actions[action].apply( this, arguments ) )
			}
		})
		return wrapped_actions
	};
	getActions = this.get_actions;
} // end Reaction class

var ReduxActionize = function(initial_state, options={}){
	return new Reaction({ 
		initial_state, 
		namespace: options.namespace, 
		type: options.type, 
		debug: options.debug 
	})
}
export default ReduxActionize