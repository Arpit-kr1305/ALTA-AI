FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src
COPY public ./public
COPY data ./data

ENV PORT=8090
EXPOSE 8090

CMD ["node", "src/server.js"]
