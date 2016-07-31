const expect = require('chai').expect

export const MOCK_USERNAME = 'myuser'
export const MOCK_PASSWORD = 'mypassword'
export const MOCK_APP_INITIAL_STATE = {
	username: null,
	password: null,
	authorized: false
}

// Mock up the Redux dispatch function
export const dispatch = function(some_action){
	expect(some_action).to.be.a('object')
	return some_action
}