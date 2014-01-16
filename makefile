test:
	@NODE_ENV=testing mocha  -R spec
commit:
	@git add .
	@git commit -am"autocommit `date`" | : 
push: commit
	@git push origin --all 
run:
	@DEBUG=express:* supervisor index.js &
ct:
	@./bin/ct.sh &
.PHONY: run test ct commit push