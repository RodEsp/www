# rodesp.dev

A repository for my personal website.

## Setup

Install dependencies:
```sh
npm install
```

## Running  with Development Server
> Will be accessible on port `8080`.

```sh
npm run dev
```

## Running with Production Server
> Will be accessible on port `80`.

```sh
npm run build:prod
npm start
```

## Dockerizing
> This will build & run as if for production.

### Build
> You will need to have the EMAIL_ENDPOINT environment variable set to a URL that can accept POST requests with JSON data.
```sh
docker build -t rodesp7/www . --build-arg ee=$EMAIL_ENDPOINT
```

### Run
```sh
docker run --name rodesp-www --rm -p 80:80 rodesp7/www
```

### Stop
```sh
docker stop rodesp-www
```