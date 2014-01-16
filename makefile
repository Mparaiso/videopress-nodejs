test:
	@NODE_ENV=testing mocha  -R spec
test-debug:
	@DEBUG=express:* NODE_ENV=testing mocha  -R spec
run:
	@DEBUG=express:* supervisor index.js &
ct:
	@./bin/ct.sh &
.PHONY: run test ct test-rest