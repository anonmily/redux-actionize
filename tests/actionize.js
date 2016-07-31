const expect = require('chai').expect
import _ from 'lodash'

import ReduxActionize, { ActionCreator } from '../es6'

import { MOCK_USERNAME, MOCK_PASSWORD, MOCK_APP_INITIAL_STATE, dispatch } from './mocks'

describe('ReduxActionize:', () => {
	var application_state = ReduxActionize('application', MOCK_APP_INITIAL_STATE)
	application_state.register({
		action: 'login',
		creator: function(username, password){
			return {
				username: username,
				password: password
			}
		},
		reducer: function(state, action){
			let { username, password } = action
			return _.assign({}, state, {
				username,
				password,
				authorized: true
			})
		}
	})

	var login_action_reducer = application_state.reducers.application_login,
		login_action_creator = application_state.actions.login

	it('should have mountpoint saved', done =>{
		expect(application_state.mountpoint).to.equal('application')
		done()
	})

	it('should have initial state saved', done => {
		expect(application_state.initial_state).to.deep.equal(MOCK_APP_INITIAL_STATE)
		done()
	})

	describe('register', () => {

		it('should add action creator', done => {
			expect( login_action_creator ).to.be.a('function')
			expect( login_action_creator( MOCK_USERNAME, MOCK_PASSWORD ) ).to.deep.equal({
				type: 'application_login',
				username: MOCK_USERNAME,
				password: MOCK_PASSWORD
			})

			done()
		})

		it('should add reducer', done => {
			let state = MOCK_APP_INITIAL_STATE,
				action = login_action_creator(MOCK_USERNAME, MOCK_PASSWORD)

			expect( login_action_reducer ).to.be.a('function')

			let new_state = login_action_reducer(state, action)
			expect( new_state ).to.deep.equal({
				username: MOCK_USERNAME,
				password: MOCK_PASSWORD,
				authorized: true
			})

			done()
		})

		it('should not be case sensitive', done => {
			var app_state_lowercase = ReduxActionize('application', MOCK_APP_INITIAL_STATE),
				app_state_propercase = ReduxActionize('application', MOCK_APP_INITIAL_STATE)

			app_state_lowercase.register({
				action: 'login',
				creator: function(username, password){
					return {
						username: username,
						password: password
					}
				},
				reducer: function(state, action){
					let { username, password } = action
					return _.assign({}, state, {
						username,
						password,
						authorized: true
					})
				}
			})

			app_state_propercase.register({
				action: 'Login',
				creator: function(username, password){
					return {
						username: username,
						password: password
					}
				},
				reducer: function(state, action){
					let { username, password } = action
					return _.assign({}, state, {
						username,
						password,
						authorized: true
					})
				}
			})

			expect( app_state_lowercase.actions.login ).to.be.a('function')
			expect( app_state_propercase.actions.login ).to.be.a('function')

			expect( app_state_lowercase.actions.login( MOCK_USERNAME, MOCK_PASSWORD ) ).to.deep.equal({
				type: 'application_login',
				username: MOCK_USERNAME,
				password: MOCK_PASSWORD
			})

			expect( app_state_propercase.actions.login( MOCK_USERNAME, MOCK_PASSWORD ) ).to.deep.equal({
				type: 'application_login',
				username: MOCK_USERNAME,
				password: MOCK_PASSWORD
			})

			done()
		})
	})

	describe('get_reducer', () => {

		var application_reducer = application_state.get_reducer()

		it('should return a function', done => {
			expect(application_reducer).to.be.a('function')
			done()
		})

		it('calling it should return a reducer for the entire global state mountpoint', done => {

			let new_state = application_reducer(
				MOCK_APP_INITIAL_STATE, 
				login_action_creator(MOCK_USERNAME, MOCK_PASSWORD) 
			)

			expect( new_state ).to.deep.equal({
				username: MOCK_USERNAME,
				password: MOCK_PASSWORD,
				authorized: true
			})

			done()
		})

		it('calling it should return initial state if no action matches', done => {

			let new_state = application_reducer(
				MOCK_APP_INITIAL_STATE, 
				{ type: 'UNMATCHEDACTION' } 
			)

			expect( new_state ).to.deep.equal( MOCK_APP_INITIAL_STATE )

			done()
		})
	})

	describe('chained registration', done => {

		var application_state = ReduxActionize('application', MOCK_APP_INITIAL_STATE)
			application_state
				.register({
					action: 'login',
					creator: function(username, password){
						return {
							username: username,
							password: password
						}
					},
					reducer: function(state, action){
						let { username, password } = action
						return _.assign({}, state, {
							username,
							password,
							authorized: true
						})
					}
				})
				.register({
					action: 'logout',
					creator: null,
					reducer: function(state, action){
						let { username, password } = action
						return _.assign({}, state, {
							username: null,
							password: null,
							authorized: false
						})
					}
				})

		var login_action_reducer = application_state.reducers.application_login,
			login_action_creator = application_state.actions.login,
			logout_action_reducer = application_state.reducers.application_logout,
			logout_action_creator = application_state.actions.logout

			it('should add action creators', done => {
				expect( login_action_creator ).to.be.a('function')
				expect( logout_action_creator ).to.be.a('function')

				expect( login_action_creator( MOCK_USERNAME, MOCK_PASSWORD ) ).to.deep.equal({
					type: 'application_login',
					username: MOCK_USERNAME,
					password: MOCK_PASSWORD
				})
				expect( logout_action_creator() ).to.deep.equal({ type: 'application_logout' })

				done()
			})

			it('should add reducers', done => {
				let state = MOCK_APP_INITIAL_STATE,
					login_action = login_action_creator(MOCK_USERNAME, MOCK_PASSWORD),
					logout_action = logout_action_creator()

				expect( login_action_reducer ).to.be.a('function')
				expect( logout_action_reducer ).to.be.a('function')

				let login_new_state = login_action_reducer(state, login_action),
					logout_new_state = logout_action_reducer(state, logout_action)

				expect( login_new_state ).to.deep.equal({
					username: MOCK_USERNAME,
					password: MOCK_PASSWORD,
					authorized: true
				})
				expect( logout_new_state ).to.deep.equal({
					username: null,
					password: null,
					authorized: false
				})

				done()
			})
	})

	describe('get_actions', () => {

		var application_actions = application_state.get_actions(dispatch)

		it('should return an object', done => {
			expect(application_actions).to.be.a('object')
			expect(Object.keys(application_actions)).to.deep.equal(['login'])
			done()
		})

		it('should run the action creator for the specified action name, then run dispatch with the resulting action', done => {
			application_actions.login(MOCK_USERNAME, MOCK_PASSWORD)
			done()
		})
	})
})