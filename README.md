# AuthZEN Todo App Interop Scenario

This is a monorepo that contains a React Todo front-end (`./src`), and a node.js Todo back-end (`./service`), which is authorized using the AuthZEN evaluations API.

## Setup

### Install dependencies
To install the application dependencies, run the following command:

```shell
yarn
```

### Set up the `.env` file
Rename the `.env.example` file to `.env` and update the `AUTHZEN_PDP_URL` variable. The authorization middleware will send AuthZEN requests to `${AUTHZEN_PDP_URL}/access/v1/evaluations`.

Optionally, set the `AUTHZEN_PDP_API_KEY` variable if your authorizer needs an API key. You should prefix it with `basic` or `Bearer` as appropriate. If set, the authorization middleware will add the `authorization: ${AUTHZEN_PDP_API_KEY}` header to every authorization request.

```shell
# Todo frontend
REACT_APP_OIDC_DOMAIN=citadel.demo.aserto.com
REACT_APP_OIDC_CLIENT_ID=citadel-app
REACT_APP_OIDC_AUDIENCE=citadel-app
REACT_APP_API_ORIGIN=http://localhost:3001

# Todo backend
JWKS_URI=https://citadel.demo.aserto.com/dex/keys
ISSUER=https://citadel.demo.aserto.com/dex
AUDIENCE=citadel-app

AUTHZEN_PDP_URL=https://your-authorizer.your-domain.com
AUTHZEN_PDP_API_KEY=basic YOUR_API_KEY
```

## Start the single-page react app and the API server

```shell
yarn start
```

## Identities

This sample uses a demo OIDC provider called "Citadel", with built-in users such as Rick and Morty. They all have the same password: ` V@erySecre#t123!`

| User | Email | 
| --- | --- |
| Rick Sanchez | rick@the-citadel.com | 
| Morty Smith | morty@the-citadel.com |
| Beth Smith | beth@the-smiths.com |
| Summer Smith | summer@the-smiths.com |
| Jerry Smith | jerry@the-smiths.com |

## Run interop tests

```shell
yarn test https://your-authorizer.your-domain.com
```

This will run the interop test suite against your AuthZEN implementation.

For example:

```shell
yarn test https://authzen-proxy.demo.aserto.com
yarn run v1.22.19
$ ./decision.sh https://authzen-proxy.demo.aserto.com
>>> checking decisions
PASS REQ:{"subject":{"identity":"CiRmZDA2MTRkMy1jMzlhLTQ3ODEtYjdiZC04Yjk2ZjVhNTEwMGQSBWxvY2Fs"},"action":{"name":"can_read_user"},"resource":{"id":"beth@the-smiths.com"}}
PASS REQ:{"subject":{"identity":"CiRmZDA2MTRkMy1jMzlhLTQ3ODEtYjdiZC04Yjk2ZjVhNTEwMGQSBWxvY2Fs"},"action":{"name":"can_delete_todo"},"resource":{"ownerID":"beth@the-smiths.com"}}
...
<<< done checking decisions


✨  Done in 0.88s.
```
