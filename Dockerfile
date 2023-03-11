FROM ubuntu

RUN apt-get update

FROM node:alpine

WORKDIR /ticktes_storage

COPY .babelrc ./

COPY package*.json ./

RUN npm install -g npm@

RUN npm install

RUN apk add tzdata

ENV TZ 'America/Guayaquil' 

RUN cd /usr/share/zoneinfo && \ 
    cp -f /usr/share/zoneinfo/$TZ /etc/localtime && \ 
    echo $TZ > /etc/timezone

COPY . .

CMD ["npm", "start"]