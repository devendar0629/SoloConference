#!/bin/sh

echo "✨ Applying database migrations..."
npm run db:migrate

echo "✨ Starting application..."
exec npm run start