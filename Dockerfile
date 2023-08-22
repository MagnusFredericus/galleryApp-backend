FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg
COPY . .

EXPOSE 5500
CMD npm start