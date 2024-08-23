FROM node:18-bullseye

WORKDIR /app/api

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 3333

CMD ["npm", "run", "dev"]