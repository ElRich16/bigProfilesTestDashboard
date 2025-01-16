#!/usr/bin/env bash

docker-compose -f "./docker-compose.yml" up --remove-orphans -V --build -d