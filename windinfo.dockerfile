FROM node:14

WORKDIR /usr/src/app

COPY ./windinformatie-server-js .

RUN npm install

EXPOSE 4000

CMD ["node", "app.js"]
