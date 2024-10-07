# generate-node-backend
Simple Node.js program to generate a backend using Node.js, [Express](https://expressjs.com/), [Prisma](https://www.prisma.io/), [TSOA](https://tsoa-community.github.io/docs/).

## Usage

First install [Node.js](https://nodejs.org/en/)

Initialize package.json
```
npm init
```
After answering the questions, install the package

```
npm install @cilinder/generate-node-backend --save-dev
```

Initialize the project

```
npx gnb init
```

Create a test route

```
npx gnb generate-test-route
```

Generate an API route and all the associated code

```
npx gnb generate-route <name of the controller generated> <the route for the API> <"Get" or "Post">
```

You can use the `dry-run` option with any command to see the files it would generate without writing anything to disk.

## Generate a test route and view the Swagger GUI


Generate the test route
```
npx gnb generate-test-route
```

Start the backend

```
npm run dev
```

The project is available at `localhost:$PORT/docs`, where `$PORT` can be found in `.env` (the port is generated randomly for each new instance).