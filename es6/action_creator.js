import is from 'simply-is'
import { upper, lower } from './utils'

/*
 * ActionCreator
 *
 * @param {string} name - name of the action
 *
 * @param {function} action_creator - A function of form: function(params){ return { ... } } (Do not include the "type" parameter, it will be added automatically) 
 *
 */
export default function ActionCreator(name, action_creator){
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