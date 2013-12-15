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
#push: push to remote repository
#
test: ./test/*.js
	@node_modules/.bin/mocha -u tdd
	@make commit
run: 
	@node_modules/.bin/node-supervisor -e 'js|less|css|twig' -p 2000 app.js &
install:
	@npm install
ct:
	@bin/ci.sh
# command || true will ignore command errors
commit:
	@git add .
	@git commit -am"update `date`" || true
push: commit
	@git push origin --all

.PHONY: install run