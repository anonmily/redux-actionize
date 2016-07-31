Redux Actionize
====================
![Redux Actionize Dependency badge](https://david-dm.org/anonmily/redux-actionize.svg)

Easier Redux Action/Reducer creation. Create actions and reducers all at once, in one place, for less duplication and cleaner, more readable code. 

* **No more separate files for actions and reducers**: declare your actions and their effect on the state all at once. No more switching back and forth between your action creator file and your reducer files when you need to add or update an action. Actually, no need for separate action and reducer files, period.

* **Define/use your action names only once, in one place.** Only write the action name once, preventing duplication and silly mistakes.

* **Automatic namespacing for the generated actions.** Actions defined for a mountpoint (e.g. application) are automatically namespaced with the mountpoint name, so no more need to declare actions like "ORDER_LOADING", "ORDER_LOADED", "PRODUCTS_LOADING", "PRODUCTS_LOADED". Instead, you'll just register the 'loading' and 'loaded' actions on the actionized order state as well as 'loading' and 'loaded' actions on the actionized products state. The namespacing will be done for you automatically to avoid overlap of actions between mountpoints. You can also purposefully turn the namespacing off for actions intended to be shared.

[GITHUB:	https://github.com/anonmily/redux-actionize](https://github.com/anonmily/redux-actionize)

[NPM:		https://www.npmjs.com/package/redux-actionize](https://www.npmjs.com/package/redux-actionize)

## Installation - Node
To install as a Node package, simply install via npm:

	npm install redux-actionize

Then, you can import redux-actionize into your Redux project (e.g. browserify, webpack, etc).

	import redux_actionize from 'redux-actionize'

By default, the ES5 transpiled version is exported, but you can use the original, ES6 non-transpiled version directly as well:

	import redux_actionize from 'redux-actionize/es6'


--------------------------------------

## Usage

First, let's declare our new actionized state. We'll be defining the actions creators and reducers all in one place, so it's easy to see both the trigger and the intended result of the action.

	import _ from 'lodash'
	import redux_actionize from 'redux-actionize'

	// redux_actionize takes the mountpoint/namespace name, and the initial state as parameters
	var ApplicationState = redux_actionize(
		'application', 
		{
			user: null,
			token: null,
			is_authorized: null,
		}
	)

	export default ApplicationState
		.register({
			action: 'LOGIN_SUCCESS',
			creator: (user, token) => { return { user, token } },
			reducer: function(state, action){
				return _.assign({}, state, {
					user: action.user,
					token: action.token,
					is_authorized: true,
				})
			}
		})
		.register({
			action: 'LOGIN_FAILURE',
			creator: null,
			reducer: function(state, action){
				return _.assign({}, state, {
					user: null,
					is_authorized: false,
					token: null,
				})
			}
		})

Then, let's add the generated reducer for this actionized state to our root reducer.

	import { combineReducers } from 'redux'
	import ApplicationState from './application_state'
	const root_reducer = combineReducers({
			application: ApplicationState.get_reducer()
		})

We can use and dispatch the action creators directly, one by one:

	import ApplicationState from './application_state'
	
	dispatch( ApplicationState.actions.login_success(user, token) )


Or we can pass in a dispatch function to **get_actions**, which will automatically wrap our actions in a dispatch for us. Rather than passing dispatch through my components, I like to have a separate model that deals with dispatch, API calls, etc, but of course, you can use it directly in your components if you'd like.

	import Store from './Store'
	const dispatch = Store.dispatch
	
	import ApplicationState from './application_state'
	const Application = ApplicationState.get_actions(dispatch)

	import API from './MyAPI'

	let ApplicationModel = {
		login: function(credentials){
			Application.login_in_progress()
			return API.login(credentials)
				.then( result => {
					if(result.success){
						Application.login_success( result.user, result.token )
					}else{
						Application.login_failure()
					}
				})
				.catch( err => {
					Application.login_failure()
				})
		}
	}

Note: Action names are not case sensitive and will all be converted to lowercase. Hence, even though we declared our action as 'LOGIN_SUCCESS', we can still use the action creator as ApplicationState.actions.login_success().

--------------------------------------

# API
* **ReduxActionize**: the factory function returned when you import the package
	+ **Parameters**
		- Mountpoint/Namespace name (*String*)
		- Initial State (*Object*)
		- Options (*Object*)
			* **debug** [true/false] (optional): print logs for every called action?
	
* **Actionized State**: what ReduxActionize returns:
	+ mountpoint (*String*)
	+ initial_state (*String*)
	+ debug (*Boolean*)
	+ reducers (*Object*)
	+ actions (*Object*)
	+ **register(config)**
		* **config.action**: Name of action (String)
		* **config.creator**: A function of form: function(params){ return { data: ""} } (Do not include the "type" parameter)
		* **config.reducer**: A function of form: function(state, action){ return new_state }
		* **config.global** (optional): Namespace actions? Default true. (Boolean)
	+ **get_reducer()**
	+ **reducer()** (alias for get_reducer())
	+ **get_actions()**

--------------------------------------

---
## Changelog
| Version | Notes                                                                                                                                                                            |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| _1.0.0_   | Initial release |
| _1.0.2_   | Minor README and package.json fixes |