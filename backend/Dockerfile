# ---------------- BUILD STAGE ----------------

FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ---------------- PRODUCTION STAGE ----------------

FROM node:lts-alpine AS production

WORKDIR /app

# Copy package.json, dist folder, node_modules and public folder
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Copy drizzle.config.ts and migrations folder
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/db/migrations ./src/db/migrations

# Copy entrypoint.sh and make it executable
COPY --from=builder /app/entrypoint.sh ./
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x ./entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
