docker-compose --env-file .env -f docker-compose.yaml stop
docker-compose --env-file .env -f docker-compose.yaml rm --force
docker volume prune --force