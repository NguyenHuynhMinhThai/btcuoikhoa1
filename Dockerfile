FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run server:build

ENV DB_HOST=db \
  DB_PORT=3306 \
  DB_USER=movie_user \
  DB_PASSWORD=movie_pass \
  DB_NAME=movie_booking

EXPOSE 4000

CMD ["npm", "run", "server:start"]

