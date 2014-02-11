#
# TARGETS
# =======
# 
# test: test
# commit: commit to repository
# cover: test coverage
# push: push to repository
# run: run app server on localhost:3000
# af: push to app fog
# 
test: compile
	@NODE_ENV=testing mocha  -R spec 
cover:
	@NODE_ENV=testing node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- -R spec  
compile: 
	@coffee -c -m -b -o js coffee
commit: compile
	@git add .
	@git commit -am"$(message) `date`" | : 
push: commit
	@git push origin --all --tags
run:
	@DEBUG=express:* NODE_ENV=development supervisor -i public/*  app.js &
.PHONY: run test ct commit push
