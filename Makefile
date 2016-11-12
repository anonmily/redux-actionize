.DEFAULT_GOAL := build

test:
	mocha --compilers js:babel-core/register tests/

build:
	# Just compile ES6
	babel es6 -d es5