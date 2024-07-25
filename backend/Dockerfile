#backend/Dockerfile

FROM node:18.17.1 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD [ "node", "server.js" ]