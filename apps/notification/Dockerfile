FROM node:lts-alpine

ENV TZ=Asia/Jakarta

WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package*.json /app/

RUN npm i -g pm2
RUN npm install

COPY . /app

ARG PORT
ENV PORT $PORT
EXPOSE $PORT

USER node

CMD ["pm2-runtime", "ecosystem.config.js"]
