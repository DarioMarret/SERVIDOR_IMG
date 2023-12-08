FROM node:alpine

WORKDIR /upload

COPY .babelrc ./


COPY package*.json ./

COPY . .

RUN npm install

RUN apk add tzdata

ENV TZ 'America/Guayaquil' 

RUN cd /usr/share/zoneinfo && \ 
    cp -f /usr/share/zoneinfo/$TZ /etc/localtime && \ 
    echo $TZ > /etc/timezone

CMD ["npm", "start"]