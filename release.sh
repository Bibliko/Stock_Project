if [ "$SERVER_TYPE" = "backend" ]; then
    cd back-end && npm run prisma-migrate-deploy
fi
