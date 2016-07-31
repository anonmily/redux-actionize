import is from 'simply-is'

// Miscellaneous Tools/Utilities
function upper(str) {
    return str ? String(str).toUpperCase() : ""
}

function lower (str) {
    return str ? String(str).toLowerCase() : ""
}

/*
 * ActionCreator
 *
 * @param {string} name - name of the action
 *
 * @param {function} action_creator - A function of form: function(params){ return { ... } } (Do not include the "_type" parameter, it will be added automatically) 
 *
 */
export function ActionCreator(name, action_creator){
	return function(){
		var args =  Array.prototype.slice.call(arguments)

		if( !action_creator ){

			action_creator = function(){ return {} }

		}else if( is.not.function(action_creator) ){

			console.error(action_creator)
			throw new TypeError('ActionCreator: action_creator is not a function')

		}

		let action_data = action_creator.apply(this, args)
		if( !action_data || is.not.object(action_data) ){

			console.error(action_data)
			throw new TypeError('ActionCreator: Result of action_creator with arguments=' + arguments.join(',') + 'is not an object.')

		}

		action_data._type = name
		return action_data
	}
}

/*
 *	Redux Actions
 *		- action names are NOT case sensitive. Action names passed in are all converted to lowercase. Thus, registering an action with name='LOGIN', name='login', or name='Login' is the same: they will all to the same action/reducer name: 'login'
 *
 *	@param {string} state_mountpoint - name of the global state mount point for the reducer (e.g. application, orders)
 *
 *	@param {object} initial_state - the initial state to iniialize this mountpoint with
 *
 * 
 */
var ReduxActionize = function(state_mountpoint, initial_state){
	return {
		mountpoint: state_mountpoint,
		initial_state: initial_state,

		/*
		 * Expect reducers to be of form:
		 *
		 *	{ 
		 *		'VERSION': function(state,action){...},
		 *	}
		 *
		 */
		reducers: {},

		/*
		 * Expect actions to be of form:
		 *
		 *	{ 
		 *		'VERSION': function(...){ return {...} }
		 *	}
		 *
		 */
		actions: {},

		/*
		 *	Register new action and expected result
		 *	
		 *	@param {string} action_name - name of the action
		 *
		 *	@param {function} action_creator - A function of form: function(params){ return { data: ""} } (Do not include the "type" parameter)
		 *
		 *	@param {function} reducer - A function of form: function(state, action){ return new_state }
		 *
		 */
		register: function(config){
			var { action, creator, reducer } = config

			// e.g. application.actions.login(username, password)
			this.actions[ lower(action) ] = ActionCreator( lower(action), creator)
			
			// e.g. application.reducers.login(state,)
			this.reducers[ lower(action) ] = reducer
			return this
		},

		get_reducer: function(){
			var { initial_state, reducers } = this
			return function(state=initial_state, action){
				let current_reducer = reducers[action._type]
				if( current_reducer ){
					return current_reducer(state, action)
				}else{
					return state
				}
			}
		},

		get_actions: function(dispatch){
			var { actions } = this

			var wrapped_actions = {}
			Object.keys(actions).forEach( action => {
				wrapped_actions[action] = function(){
					dispatch( actions[action].apply( this, arguments ) )
				}
			})

			return wrapped_actions
		}
	}
}
export default ReduxActionize