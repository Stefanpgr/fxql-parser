FROM node:20-alpine AS BUILD_IMAGE
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY package.json ./
COPY package-lock.json ./
COPY ./prisma ./prisma
COPY *.env ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]