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

## Terms - Managing State

I like to divide up different parts of my state management as follows, in order of increasing abstraction:

1. **API Models** - Abstracts out backend API AJAX requests, so you can change your API routes/definitions all in one place (and share it between projects that use the same API).
2. **Reactions** - Definitions of the actions and their expected reactions/effects on the application state.
3. **State Models** - Methods that your components will use to do things that change state, request data (and change state), etc. These state models will use **API Models** to actually interact with the backend API and **Reactions** to manipulate and incorporate data from the API into the application state.

![Managing State with Redux and Redux Actionize](/redux_actionize_model.png)

--------------------------------------

## Reaction Definition

First, let's declare a new **Reaction Definition** for our application state (which will be mounted at state.application). 

We'll be defining the actions creators and reducers all in one place, so it's easy to see both the trigger and the intended result of the action.

	// application_state.js

	import _ from 'lodash'
	import redux_actionize from 'redux-actionize'
	
	// redux_actionize takes the mountpoint/namespace name, and the initial state as parameters, returning a new Reaction Definition
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

If the creator is falsy/null, then it will be as if function(){ return {} } were provided as the creator, and no extra data will be added to the generated action. Thus, for the 'LOGIN_FAILURE' action/event defined above, the generated action object will be { type: 'application_login_failure' }.

Then, let's add the automatically generated reducer for this **State Reaction** to our root reducer.

	// redux/index.js

	import { combineReducers } from 'redux'
	import ApplicationState from './application_state'
	const root_reducer = combineReducers({
			application: ApplicationState.get_reducer()
		})

We can then use and dispatch the action creators directly, one by one:

	import ApplicationState from './application_state'
	
	dispatch( ApplicationState.actions.login_success(user, token) )


Or we can pass in a dispatch function to **get_actions**, which will automatically wrap our actions in a dispatch for us. 

	import ApplicationState from './application_state'
	const Application = ApplicationState.get_actions(dispatch)
    
	Application.login_success( user, token )
	Application.login_failure()

--------------------------------------

## Using State Models

Rather than passing dispatch through the components, I use a separate model that deals with dispatch, API calls, etc, but of course, you can use it directly in your components if you'd like.

	// model_application.js

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
	+ initial_state (*Object*)
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
| _1.0.4_   | Minor README and package.json fixes |