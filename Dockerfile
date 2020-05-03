FROM node:lts AS build
ENV NODE_ENV=dev

WORKDIR /build
COPY . .

RUN npm install
RUN npm run build-prod

FROM node:lts-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm install --production
COPY --from=build /build/dist ./

EXPOSE 8080
ENTRYPOINT [ "node", "server.js" ]