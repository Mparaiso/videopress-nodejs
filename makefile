#
# TARGETS
# =======
# 
# test: test
# commit: commit to repository
# cover: test coverage
# push: push to repository
# run: run app server on localhost:3000
# 
test:
	@NODE_ENV=testing mocha  -R list
cover:
	@NODE_ENV=testing node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- -R spec  
commit:
	@git add .
	@git commit -am"autocommit `date`" | : 
push: commit
	@git push origin --all 
run:
	@DEBUG=express:* NODE_ENV=development supervisor index.js &
.PHONY: run test ct commit push
