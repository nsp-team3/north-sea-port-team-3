FROM openjdk:latest

RUN apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
  && apt-get install -y nodejs \
  && curl -L https://www.npmjs.com/install.sh | sh \
RUN npm install -g grunt grunt-cli

WORKDIR /usr/src/app

COPY ./windinformatie-server-js .

RUN npm install

EXPOSE 7000

CMD ["node", "app.js"]
