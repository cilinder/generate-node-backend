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
npm install @cilinder/generate-node-backend
```

Initialize the project

```
npx generate-node-backend init
```

Create a test route

```
npx generate-node-backend generate-test-route
```

Generate an API route and all the associated code

```
npx generate-node-backend generate-route --name=<name of the controller generated> --route=<the route for the API> --type=<"Get" or "Post">
```

