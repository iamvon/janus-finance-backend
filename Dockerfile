FROM node:14
ENV TZ="Asia/Ho_Chi_Minh"
WORKDIR /usr/app
RUN npm install -g nodemon

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 2999 2999

CMD [ "npm", "run", "start:prod" ]