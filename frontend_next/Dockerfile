FROM node:20-alpine

WORKDIR /app

COPY app_self/ .
RUN npm install

EXPOSE 9001

CMD ["npm", "run", "dev"]
