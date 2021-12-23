FROM node:14
RUN apt-get -y install default-jre

WORKDIR /usr/src/app

COPY ./windinformatie-server-js .

RUN npm install

EXPOSE 7000

CMD ["node", "app.js"]
