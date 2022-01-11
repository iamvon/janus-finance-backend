./remove.sh
docker-compose --env-file .env -f docker-compose.yaml up -d --build --force-recreate -V
./log.sh