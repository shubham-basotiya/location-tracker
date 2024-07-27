#backend/Dockerfile

FROM node:18-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD [ "node", "server.js" ]