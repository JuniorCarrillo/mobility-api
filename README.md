# mobility-api v0.0.1

[![Nestjs](https://github.com/JuniorCarrillo/mobility-api/workflows/Nestjs/badge.svg)](https://github.com/JuniorCarrillo/mobility-api/actions?query=workflow:"Nestjs")
[![GitHub tag](https://img.shields.io/github/tag/JuniorCarrillo/mobility-api?include_prereleases=&sort=semver&color=blue)](https://github.com/JuniorCarrillo/mobility-api/releases/)
[![Sourcegraph](https://sourcegraph.com/github.com/JuniorCarrillo/mobility-api/-/badge.svg?style=flat-square)](https://sourcegraph.com/github.com/JuniorCarrillo/mobility-api?badge)
[![License](http://img.shields.io/badge/license-mit-blue.svg?style=flat-square)](https://raw.githubusercontent.com/JuniorCarrillo/mobility-api/master/LICENSE)
[![JuniorCarrillo - mobility-api](https://img.shields.io/static/v1?label=JuniorCarrillo&message=mobility-api&color=blue&logo=github)](https://github.com/JuniorCarrillo/mobility-api "Go to GitHub repo")
[![stars - mobility-api](https://img.shields.io/github/stars/JuniorCarrillo/mobility-api?style=social)](https://github.com/JuniorCarrillo/mobility-api)
[![forks - mobility-api](https://img.shields.io/github/forks/JuniorCarrillo/mobility-api?style=social)](https://github.com/JuniorCarrillo/mobility-api)
[![OS - macOS](https://img.shields.io/badge/OS-macOS-blue?logo=apple&logoColor=white)](https://www.apple.com/macos/ "Go to Apple homepage")
[![OS - Linux](https://img.shields.io/badge/OS-Linux-blue?logo=linux&logoColor=white)](https://www.linux.org/ "Go to Linux homepage")
[![Made with Docker](https://img.shields.io/badge/Made_with-Docker-blue?logo=docker&logoColor=white)](https://www.docker.com/ "Go to Docker homepage")

This is an Uber-like API (for mobility) developed in TypeScript with Nestjs, using TypeORM with PostgreSQL for data persistence. It integrates a demo payment gateway and allows cost calculation for a linear service by calculating distance, time, and adding a base fee. It uses native Axios within Nestjs to consume data.

This API was developed to be used with a PostgreSQL instance in Docker, so having Docker along with Node and Yarn are the prerequisites.

**This project was developed on MacOS**

## Install

1. Clone the repository
```
git clone https://github.com/JuniorCarrillo/mobility-api.git
```

2. Copy environments
```
cd mobility-api && cp .env.example .env
```

3. Install dependencies (require Docker)
```
docker compose up -d && yarn make
```

4. Run application

```
yarn start:dev
```

5. Running on port 3000

```
open http://localhost:3000/docs
```

## Use

Here are listed the available endpoints or routes within the REST service. It should be noted that you can expand this information by accessing the Swagger generated from the same API at the `/docs` endpoint, since security middleware, JWT, and route control by roles are implemented.

### POST /auth/driver/register (Register driver in POST method)

Request example:
``` bash
curl --location 'http://localhost:3000/auth/driver/register' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Driver",
  "password": "12345678",
  "email": "driver@app.co"
}'
```

Response example:
``` json
{
    "name": "Driver",
    "email": "driver@app.co",
    "role": "DRIVER",
    "id": 1,
    "createAt": "2023-04-15T21:01:17.399Z",
    "updateAt": "2023-04-15T21:01:17.399Z"
}
```

### POST /auth/rider/register (Rider driver in POST method)

Request example:
``` bash
curl --location 'http://localhost:3000/auth/rider/register' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Rider",
  "password": "12345678",
  "email": "rider@app.co"
}'
```

Response example:
``` json
{
    "name": "Rider",
    "email": "rider@app.co",
    "role": "RIDER",
    "id": 2,
    "createAt": "2023-04-15T21:01:58.395Z",
    "updateAt": "2023-04-15T21:01:58.395Z"
}
```

### POST /auth/login (Login in POST method)

Request example:
``` bash
curl --location 'http://localhost:3000/auth/login' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
    "password": "12345678",
    "email": "driver@app.co"
}'
```

Response example for rider:
``` json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUklERVIiLCJzdWIiOjIsImlhdCI6MTY4MTU5MjU1MCwiZXhwIjoxNzEzMTUwMTUwfQ.QSXE4lz4D0IfmKdJNWjofOPWtvekvR5ybajO_RJiMH4",
    "user": {
        "id": 2,
        "name": "Rider",
        "email": "rider@app.co",
        "role": "RIDER",
        "createAt": "2023-04-15T21:01:58.395Z",
        "updateAt": "2023-04-15T21:01:58.395Z"
    }
}
```

Response example for driver:
``` json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiRFJJVkVSIiwic3ViIjoxLCJpYXQiOjE2ODE1OTI1ODMsImV4cCI6MTcxMzE1MDE4M30.umwXqvUNz2Ft48bKqIEwNC1RLGH2dkxWyP28GAVPNg0",
    "user": {
        "id": 1,
        "name": "Driver",
        "email": "driver@app.co",
        "role": "DRIVER",
        "createAt": "2023-04-15T21:01:17.399Z",
        "updateAt": "2023-04-15T21:01:17.399Z"
    }
}
```

### POST /user/card (Add new card to user)

Request example:
``` bash
curl --location 'http://localhost:3000/user/card' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUklERVIiLCJzdWIiOjIsImlhdCI6MTY4MTU5MjU1MCwiZXhwIjoxNzEzMTUwMTUwfQ.QSXE4lz4D0IfmKdJNWjofOPWtvekvR5ybajO_RJiMH4' \
--data '{
    "number": "4242424242424242",
    "cvc": "123",
    "exp_month": "08",
    "exp_year": "28",
    "card_holder": "José Pérez"
}'
```

Response example:
``` json
{
    "token": "tok_test_14154_3461ef5827d0C716Ec16f1649b67b3bA",
    "brand": "VISA",
    "last_four": "4242",
    "exp_year": "28",
    "exp_month": "08",
    "id": 1,
    "createAt": "2023-04-15T21:03:38.134Z",
    "updateAt": "2023-04-15T21:03:38.134Z"
}
```

### POST /rider (Request a ride by user rider)

Request example:
``` bash
curl --location 'http://localhost:3000/rider' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUklERVIiLCJzdWIiOjIsImlhdCI6MTY4MTU5MjU1MCwiZXhwIjoxNzEzMTUwMTUwfQ.QSXE4lz4D0IfmKdJNWjofOPWtvekvR5ybajO_RJiMH4' \
--data '{
  "location": [6.227613, -75.5799254],
  "destination": [6.1664595, -75.625661],
  "installments": 5
}'
```

Response example:
``` json
{
    "location": [
        6.227613,
        -75.5799254
    ],
    "destination": [
        6.1664595,
        -75.625661
    ],
    "installments": 5,
    "rider": {
        "id": 2,
        "name": "Rider",
        "email": "rider@app.co",
        "role": "RIDER",
        "createAt": "2023-04-15T21:01:58.395Z",
        "updateAt": "2023-04-15T21:01:58.395Z"
    },
    "driver": {
        "id": 1,
        "name": "Driver",
        "email": "driver@app.co",
        "role": "DRIVER",
        "createAt": "2023-04-15T21:01:17.399Z",
        "updateAt": "2023-04-15T21:01:17.399Z"
    },
    "card": {
        "id": 1,
        "token": "tok_test_14154_3461ef5827d0C716Ec16f1649b67b3bA",
        "brand": "VISA",
        "last_four": "4242",
        "exp_year": "28",
        "exp_month": "08",
        "createAt": "2023-04-15T21:03:38.134Z",
        "updateAt": "2023-04-15T21:03:38.134Z"
    },
    "id": 1,
    "status": "REQUEST",
    "finishAt": "2023-04-15T21:04:37.493Z",
    "createAt": "2023-04-15T21:04:37.493Z",
    "updateAt": "2023-04-15T21:04:37.493Z"
}
```

### POST /driver/finish/:id (Finish ride by user driver)

Request example:
``` bash
curl --location --request POST 'http://localhost:3000/driver/finish/1' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiRFJJVkVSIiwic3ViIjoxLCJpYXQiOjE2ODE1OTI1ODMsImV4cCI6MTcxMzE1MDE4M30.umwXqvUNz2Ft48bKqIEwNC1RLGH2dkxWyP28GAVPNg0'
```

Response example:
``` json
{
    "id": 1,
    "location": [
        6.227613,
        -75.5799254
    ],
    "destination": [
        6.1664595,
        -75.625661
    ],
    "status": "COMPLETE",
    "installments": 5,
    "finishAt": "2023-04-15T21:05:20.454Z",
    "createAt": "2023-04-15T21:04:37.493Z",
    "updateAt": "2023-04-15T21:05:20.462Z",
    "driver": {
        "id": 1,
        "name": "Driver",
        "email": "driver@app.co",
        "role": "DRIVER",
        "createAt": "2023-04-15T21:01:17.399Z",
        "updateAt": "2023-04-15T21:01:17.399Z"
    },
    "rider": {
        "id": 2,
        "name": "Rider",
        "email": "rider@app.co",
        "role": "RIDER",
        "createAt": "2023-04-15T21:01:58.395Z",
        "updateAt": "2023-04-15T21:01:58.395Z"
    },
    "card": {
        "id": 1,
        "token": "tok_test_14154_3461ef5827d0C716Ec16f1649b67b3bA",
        "brand": "VISA",
        "last_four": "4242",
        "exp_year": "28",
        "exp_month": "08",
        "createAt": "2023-04-15T21:03:38.134Z",
        "updateAt": "2023-04-15T21:03:38.134Z"
    }
}
```

## Contribution

If you want to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a branch (`git checkout -b feature/new-feature`)
3. Make the necessary changes and commit (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a pull request

## License

[MIT License](https://github.com/JuniorCarrillo/mobility-api/blob/master/LICENSE) © Junior Carrillo

### Contact us
- [Email](mailto:soyjrcarrillo@gmail.com)
- [WhatsApp](https://wa.me/+573003328389)
- [Telegram](https://t.me/juniorcarrillo)
- [Facebook](https://fb.com/soyjrcarrillo)
- [Twitter](https://twitter.com/soyjrcarrillo)
- [Instagram](https://instagram.com/soyjrcarrillo)
