FROM node:lts AS build
ENV NODE_ENV=dev

WORKDIR /build
COPY . .

RUN npm install
RUN npm run build:prod

FROM node:lts-alpine
ENV NODE_ENV=production

ARG ee
ENV EMAIL_ENDPOINT=${ee}

WORKDIR /app

COPY package*.json ./
RUN npm ci --production
COPY --from=build /build/dist ./

EXPOSE 80
ENTRYPOINT [ "node", "server.cjs" ]