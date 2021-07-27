all: help

help:
	@echo ----------------------------------
	@echo devtestbr API DEPLOYMENT COMMANDS
	@echo ----------------------------------
	@echo make image 	- build and upload docker image to minikube environment
	@echo make apply 	- deploy devtestbr-api and expose service
	@echo make test 	- test deployment
	@echo make delete	- uninstall devtestbr-api deployment and service

delete:
	kubectl delete service devtestbr-service
	kubectl delete deployment devtestbr-api

image:
	eval $(minikube docker-env)
	docker image prune -f
	docker build -t brandiqa/devtestbr-api .

apply:
	kubectl apply -f deploy/devtestbr-deployment.yml
	kubectl get services | grep devtestbr

test:
	curl 10.98.55.109:4000/devtestbr

local-run:
	ENDPOINT=http://localhost:4000/devtestbr k6 run performance-test.js

local-influx-run:
	ENDPOINT=http://localhost:4000/devtestbr k6 run -o influxdb=http://localhost:8086/k6 performance-test.js

run:
	ENDPOINT=http://10.98.55.109:4000/devtestbr k6 run -o influxdb=http://localhost:8086/k6 performance-test.js
