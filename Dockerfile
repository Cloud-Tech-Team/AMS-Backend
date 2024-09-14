FROM node:18.12.0

WORKDIR /usr/src/app

COPY . ./

RUN npm clean-install

RUN ls -la

CMD ["node", "server.js"]