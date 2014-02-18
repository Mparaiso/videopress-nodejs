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
test: compile
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
run:
	NODE_ENV=development supervisor -w 'views,js,coffee' -e 'coffee|js|html|twig' app.js &
deploy: push
	@git push heroku master
.PHONY: run test commit push compile deploy
