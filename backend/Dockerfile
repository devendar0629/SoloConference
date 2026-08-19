# ---------------- BUILD STAGE ----------------

FROM node:lts-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ---------------- PRODUCTION STAGE ----------------

FROM node:lts-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/entrypoint.sh ./

ENTRYPOINT [ "/app/entrypoint.sh" ]
