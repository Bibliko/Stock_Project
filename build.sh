if [ "$SERVER_TYPE" = "backend" ]; then
    npm run build-backend
else
    npm run build-frontend
fi