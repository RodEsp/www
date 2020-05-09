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
npm run build-prod
npm start
```

## Dockerizing
> This will build & run as if for production.

### Build
```sh
docker build -t rodesp/www .
```

### Run
```sh
docker run --name rodesp-www --rm -p 80:80 rodesp/www
```

### Stop
```sh
docker stop rodesp-www
```