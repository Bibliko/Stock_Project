if [ "$SERVER_TYPE" = "backend" ]; then
    npm run start-backend
else
    npm run start-frontend
fi