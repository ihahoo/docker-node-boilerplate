FROM node:6.9.2-alpine

ENV appdir /usr/src/app/
RUN mkdir -p $appdir
WORKDIR $appdir

COPY package.json .
RUN npm install --only=production

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
