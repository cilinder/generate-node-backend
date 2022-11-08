# generate-node-backend
Simple nodejs program to generate a nodejs backend

## Usage

First download the project
```
git clone https://github.com/cilinder/generate-node-project.git
```
or
```
git clone git@github.com:cilinder/generate-node-project.git
```

```
cd generate-node-project
```

Install dependencies

```
npm install
```

Generate a new nodejs project template

```
npm run init -- --path=<path where to create project> --name=<name of project>
```

**Note the extra "--" before the arguments!** This is becasue of how npm passes arguments to node, it won't work without it.

Generate an API route and all the associated code

```
npm run generate-route -- --path=<path to project> --name=<name of the controller generated> --route=<the route for the API> --type=<"Get" or "Post">
```

