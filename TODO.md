# TODO

## CORS

disable or restrict the use of CORS when deploying

## ENVIRONMENT VARIABLES

Make sure to set the environment variables for the project in
the Deployment tool, also use the proper API URL instead of localhost

## TESTING

consider using CI/CD tools like Github actions, and write automated tests.

use pg_dump -U youruser -h yourhost yourdb > db_dump.sql command to
create a database to use for the tests (store it in /db or /scrips)

create a docker service to generate a postgreSQL instance for testing

Truncate tables between tests

## Stripe API

learn about the Stripe API to simulate a transaction for this website.
