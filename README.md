# generate-node-backend
Simple nodejs program to generate a nodejs backend

## Usage

First install [nodejs](https://nodejs.org/en/)

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
npx gnb generate-route --name=<name of the controller generated> --route=<the route for the API> --type=<"Get" or "Post">
```

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