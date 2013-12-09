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
#commit: commit changes
#
test: ./test/*.js
	@node_modules/.bin/mocha -R spec
	@make commit
run: test
	@node_modules/.bin/node-supervisor -e 'js|less|css|twig' -p 2000 app.js
install:
	@npm install
ct:
	@bin/ci.sh
commit:
	# command || true will ignore command errors
	@git add .
	@git commit -am"update `date`" || true
push: commit
	git push origin -all

.PHONY: install