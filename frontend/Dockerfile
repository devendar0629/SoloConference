# ---------------- BUILD STAGE ----------------

FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN --mount=type=secret,id=frontend_env_file,target=/app/.env npm run build

# ---------------- PRODUCTION STAGE ----------------

FROM nginx:stable-alpine AS production

WORKDIR /app

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
