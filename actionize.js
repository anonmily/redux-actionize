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
 * @param {function} action_creator - A function of form: function(params){ return { ... } } (Do not include the "type" parameter, it will be added automatically) 
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
			throw new TypeError(`ActionCreator : ${name} : Result of action_creator with arguments=${args.join(',')} is not an object.`)

		}

		action_data.type = name
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
var ReduxActionize = function(state_mountpoint, initial_state, options){

	var Actionize = {
		mountpoint: state_mountpoint,
		initial_state: initial_state,
		debug: options ? options.debug : false,

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
			var { action, creator, reducer, global } = config
			var { mountpoint } = this

			/* Example of action mapping
			 * 
			 * Actions will be namespaced with the mountpoint name to prevent collisions, unless the global setting is set.
			 *
			 * mountpoint=application, action=login 
			 * 	--> application.actions.login(username, password) 
			 *	--> action = 'application_login'
			 * 
			 * If global option is set, the action name will not be namespaced:
			 * 
			 * mountpoint=application, action=login 
			 * 	--> application.actions.login(username, password) 
			 *	--> action = 'login'
			 */

			if( global ){
				var action_name = lower(action)
			}else{
				var action_name = lower(mountpoint + '_' + action)
			}
			this.actions[ lower(action) ] = ActionCreator(action_name, creator)
			
			// e.g. application.reducers.application_login(state,)
			this.reducers[ action_name ] = reducer
			return this
		},

		get_reducer: function(){
			var { initial_state, reducers, mountpoint } = this
			return function(state=initial_state, action){
				let current_reducer = reducers[action.type]
				if( current_reducer ){
					return current_reducer(state, action)
				}else{
					return state
				}
			}
		},

		get_actions: function(dispatch){
			var { actions, debug, mountpoint } = this

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
		}
	}

	Actionize.reducer = Actionize.get_reducer

	return Actionize
}
export default ReduxActionize