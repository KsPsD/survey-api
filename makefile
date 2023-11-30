
.PHONY: start stop 

start:
	@echo "Starting Survey API..."
	docker-compose up -d
	npm run start

stop:
	@echo "Stopping Survey API..."
	docker-compose down


