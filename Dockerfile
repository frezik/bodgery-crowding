FROM node:12.16.3

WORKDIR /usr/src/app

COPY package.json .
COPY app.ts .
COPY scripts scripts
COPY src src
COPY config.yaml .
RUN npm install
RUN npm install -g ts-node
RUN ts-node scripts/createdb.ts
EXPOSE 3000

CMD [ "npm", "start" ]
