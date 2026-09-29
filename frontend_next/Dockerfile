FROM node:20-alpine

WORKDIR /app

COPY app_self/ .
RUN npm install

RUN npm run build

EXPOSE 9001


# CMD ["npm", "run", "dev"]
CMD ["npm", "run", "start"]
