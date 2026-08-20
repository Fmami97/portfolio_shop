# PORTFOLIO PROJECT

## Table of Contents

- [Project information](#project-information)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [API server installation](#api-server-installation)
    - [Database installation](#database-installation)
- [API server endpoints](#api-server-endpoints)
- [API credits](#api-credits)
- [License](#license)

## Project information

- **AUTHOR** : Francesco Mami (https://github.com/fmami97)
- **DESCRIPTION** : A web app that connects to a database to handle a simple shop, with simulated transactions with the Stripe API.
  users are authenticated via traditionnal username / password or with a Oauth2 provider (google or facebook).
- **DATE OF CREATION**: May 2026

## Getting started

### Prerequisites / technologies

This project was created with these specs:

- Node v22.21.0
- npm v11.6.2
- PostgreSQL v18.6
- Postman v1.23.7

### Installation

#### API server installation

at the root of the project, run the following command, it
will install all dependencies for the API server

```bash
npm install
```

you will need to set the environment variables, a .env_model file is provided,
rename it to .env, then follow the instructions in that file to setup all the necessary steps to run the
API server properly

#### Database installation

An sql file is provided in the DATABASE_MODEL folder, import it in your preferred
database app, as mentionned before, I used PostgreSQL.

once installed, you may want to create a new user and assign it
the db_ecommerce database with all privileges, then use that user and password in your .env file instead of the superuser.

### running the server

```bash
# for production
npm run start
#for development
npm run dev
```

## API server endpoints

the openapi.yaml file can be used to check on all the available public routes.
after starting your API, opening the link in your browser will redirect
you to the openAPI hosted user interface to check and test your routes.

You may also use postman by importing the collection.postman.json file in your postman app.

## API credits

These are the external API's I have used

- [the google's oauth authentication](https://developers.google.com/terms/)
- [the facebook oauth authentication](https://developers.facebook.com/terms/)
- [express's version of the OpenAPI's swagger-ui tool](https://www.npmjs.com/package/swagger-ui-express) which is under [Apache 2.0 license](https://github.com/swagger-api/swagger-ui?tab=Apache-2.0-1-ov-file)
- [Stripe's API designed for Node](https://github.com/stripe/stripe-node) which is under MIT license(https://github.com/stripe/stripe-node/blob/master/LICENSE)
  All trademaks and copyrighs are property of their respective owners.

## License

This project's aim is purely for academic / personal use only, none of the data provided
is linked to real persons, the initial data was generated via the [mockaroo](www.mockaroo.com) website.

You are allowed to view and share this project, but do not use it commercially
