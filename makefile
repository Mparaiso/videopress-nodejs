#
# TARGETS
# =======
# 
# test: test
# commit: commit to repository
# compile: build project
# push: push to repository
# run: run app server on localhost:3000
# @DEBUG=express:* 
test: 
	@clear
	@NODE_ENV=testing mocha -R spec $(extra)
cover:
	@NODE_ENV=testing node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- -R spec  
compile: 
	@coffee -c -m -b -o js coffee
compile-watch:
	@coffee -c -m -b -w -o js coffee &
commit: compile
	@git add .
	@git commit -am"$(message) `date`" | : 
push: commit
	@git push origin master --tags
start:
	@NODE_ENV=development supervisor -i 'node_modules' -w 'views,coffee' -e 'coffee|js' app.js &
deploy: push
	@git push heroku master -f
.PHONY: start test commit push compile deploy
