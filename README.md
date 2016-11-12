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

	// redux/application.js
	// Declare the reactions for the application namespace

	import _ from 'lodash'
	import Reaction from 'redux-actionize'
	
	// redux_actionize takes the mountpoint/namespace name, and the initial state as parameters, returning a new Reaction Definition
	export default Reaction({
		user: null,
		token: null,
		is_authorized: null,
	})

	// Namespace actions, add "application" as the prefix to all actions
	.namespace('application')

	// By default, names/actions are camelCase, but you can also use underscores
	.type('camelcase')	
	
	// Register a new reaction. Action names are case insensitive
	.register({
		action: 'Login Success',
		creator: (user, token) => { return { user, token } },
		reducer: (state, action) => {
			return _.assign({}, state, {
				user: action.user,
				token: action.token,
				is_authorized: true,
			})
		}
	})
	.register({
		action: 'Login Failure',
		creator: null,
		reducer: (state, action) => {
			return _.assign({}, state, {
				user: null,
				is_authorized: false,
				token: null,
			})
		}
	})

--------------------------------------

## Adding auto-generated reducers to root reducer

Then, let's add the automatically generated reducer for this **State Reaction** to our root reducer.

	// redux/index.js

	import { combineReducers } from 'redux'
	import ApplicationState from './application_state'
	const root_reducer = combineReducers({
		application: ApplicationState.reducer()
	})

We can then use and dispatch the action creators directly, one by one:

	import ApplicationState from './application_state'
	dispatch( ApplicationState.actions.loginSuccess(user, token) )


Or we can pass in a dispatch function to **get_actions**, which will automatically wrap our actions in a dispatch for us. 

	import ApplicationState from './application_state'
	const Application = ApplicationState.getActions(dispatch)
    
	Application.loginSuccess( user, token )
	Application.loginFailure()

--------------------------------------

## 
Rather than passing dispatch through the components, using a separate model that deals with dispatch, API calls, etc, can come in useful. But of course, you could still use it directly in your components if you'd like.

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

--------------------------------------

# Additional Notes
* If the creator is falsy/null, then it will be as if function(){ return {} } were provided as the creator, and no extra data will be added to the generated action. 
* Action names are case insensitive and will stripped of any whitespace and dashes. 
* For example, the 'Login Failure' action declaration will automatically generate:
	1. *Action creators* (depending on the naming type you've chosen)
		* ApplicationState.loginFailure  --> { type: 'applicationLoginFailure' } or 
		* ApplicationState.login_failure --> { type: 'application_login_failure' }
	2. *Reducers*


--------------------------------------

# API
**ReduxActionize**: the factory function returned when you import the package
	+ **Parameters**
		- Initial State (*Object*)
		- Options (*Object*)
			* **debug** [true/false] (optional): print logs for every called action?
			* **namespace** (optional): namespace the created actions with a prefix?
	
**Actionized State**: what ReduxActionize returns:
Properties
* initial_state (*Object*)
* debug (*Boolean*)
* reducers (*Object*)
* actions (*Object*)
* _namespace (*String*) - currently set namespace
* _type (*String*) - currently set naming type (CAMELCASE|UNDERSCORE)

Set Namespace
* **namespace** (*Function*) - set the namespace
* **setNamespace** (*Function*) (alias for namespace())
* **set_namespace (*Function*) (alias for namespace())

Set Naming Type
* **type** (*Function*) - set the naming type
* **setType** (*Function*) (alias for type())
* **set_type** (*Function*) (alias for type())

Register a new reaction
* **register(config)**
	* **config.action**: Name of action (String)
	* **config.creator**: A function of form: function(params){ return { data: ""} } (Do not include the "type" parameter)
	* **config.reducer**: A function of form: function(state, action){ return new_state }
	* **config.global** (optional): Namespace actions? Default true. (Boolean)

Get reducer
* **reducer()** (*Function*)
* **get_reducer()** (*Function*)(alias for reducer())
* **getReducer()** (*Function*)(alias for reducer())

Get actions
* **get_actions()** (*Function*)
* **getActions()** (*Function*)(alias for get_actions)

--------------------------------------

---
## Changelog
| Version | Notes                                                                                                                                                                            |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| _1.0.0_   | Initial release |
| _1.0.4_   | Minor README and package.json fixes |
| _2.0.0_ 	| Allow separate setting of naming type (camelCase/underscore) and of namespace. | 