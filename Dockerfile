FROM node:12-alpine3.11

RUN mkdir -p /alphavantage/public
RUN mkdir -p /alphavantage/src
RUN mkdir -p /alphavantage/files/backup
RUN mkdir -p /alphavantage/tmpFiles

WORKDIR /alphavantage

VOLUME ./files
VOLUME ./tmpFiles

COPY ./public/* ./public/
COPY ./src/* ./src/
COPY ./.env ./
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install -y

EXPOSE 80

ENTRYPOINT ["npm", "start"]