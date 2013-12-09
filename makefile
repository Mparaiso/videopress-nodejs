#
#TARGETS
#=======
#
#test: test application with mocha
#
#run: run server with supervisor
#
#install: install npm dependencies
#
#ct: continuous testing
#
test: commit ./test/*.js
	@node_modules/.bin/mocha -R spec
run: test
	@node_modules/.bin/node-supervisor -e 'js|less|css|twig' -p 2000 app.js
install:
	@npm install
ct:
	@bin/ci.sh
commit:
	@git add .
	@git commit -am"update"

.PHONY: install