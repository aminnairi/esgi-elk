.PHONY: start stop restart ndjson install

install:
	docker-compose run --rm yarn

start:
	docker-compose up --detach elasticsearch kibana

stop:
	docker-compose down --remove-orphans --volumes --timeout 0

restart: stop start

ndjson:
	docker-compose run --rm node main.mjs
