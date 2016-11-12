const expect = require('chai').expect
import _ from 'lodash'

import { to_underscore } from '../es6/utils'

describe('to_underscore:', () => {
	it('not case sensitive - will be all lowercase', done => {
		expect( 
			to_underscore('ThIs IS AN ActIoN')
		).to.equal('this_is_an_action')
		done()
	})

	it('strips out all spaces and replaces with underscores', done => {
		expect(
			to_underscore('hello    world   ')
		).to.equal('hello_world')
		done()
	})

	it('replaces dashes with underscores', done => {
		expect(
			to_underscore('hello-world---again')
		).to.equal('hello_world_again')
		done()
	})
})