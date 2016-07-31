const expect = require('chai').expect
import _ from 'lodash'

import { ActionCreator } from '../actionize'
import { MOCK_USERNAME, MOCK_PASSWORD } from './mocks'

// Mock up the Redux dispatch function
const dispatch = function(some_action){
	expect(some_action).to.be.a('object')
	return some_action
}

describe('ActionCreator', () => {

	var action_creator = ActionCreator('login', function(username, password){
		return {
			username: username,
			password: password,
			authorized: true
		}
	})

	it('should return a function', done => {
		expect(action_creator).to.be.a('function')
		done()
	})

	it('should return an action_creator function that returns an action', done => {
		expect(action_creator(MOCK_USERNAME, MOCK_PASSWORD)).to.deep.equal({
			type: 'login',
			username: MOCK_USERNAME,
			password: MOCK_PASSWORD,
			authorized: true
		})
		done()
	})

	it('should return an action_creator that just contains the action type (type) if a null/falsy, non-function value is passed instead of the action creator function', done => {

		let action_creator = ActionCreator( 'logout', null )
		expect( action_creator() ).to.deep.equal({
			type: 'logout'
		})
		done()
	})
})