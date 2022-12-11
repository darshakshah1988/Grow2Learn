build:
	npm run build

run:
	npm start

install:
	npm install

db:
	./node_modules/.bin/ts-node --project server/tsconfig.json server/reset-database.ts -run

dev:
	npm run dev

server:
	./node_modules/.bin/nodemon

lint:
	npm run lint

test:
	npm test

deploy:
	git push heroku master

# usage make component app=admin name=widget
component:
	mkdir -p src/components/$(app)/$(name)
	touch src/components/$(app)/$(name)/$(name).html
	touch src/components/$(app)/$(name)/$(name).scss
	sed 's/my-component/$(name)/g' src/components/base.ts > src/components/$(app)/$(name)/$(name).ts
	sed 's/MyComponent/$(name)/g' src/components/base.ts > src/components/$(app)/$(name)/$(name).ts
	echo "export * from './$(name)'" > src/components/$(app)/$(name)/index.ts

.PHONY: dev test server
