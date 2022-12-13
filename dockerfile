FROM node:alpine

WORKDIR /oceane

COPY package.json ./

COPY prisma ./prisma/

COPY .env ./

COPY tsconfig.json ./

COPY . .

RUN npm install

RUN npx prisma generate

EXPOSE 6542

CMD npm run prod