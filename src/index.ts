import { executionAsyncResource } from "async_hooks";
import fs, { read } from "fs";
import { exit } from "process";
import readline from "readline";
import { spawn } from 'child_process';
import os from 'os';
import yargs from 'yargs';
import SimpleGit from 'simple-git';

const argv = yargs
  .option('name', {
      description: 'The name',
      alias: 'n',
      type: 'string'
  })
  .option('route', {
    alias: 'r',
    description: 'The API route to be generated',
    type: 'string'
  })
  .option('type', {
    alias: 't',
    description: 'Get or Post requst',
    type: 'string'
  })
  .option('path', {
    alias: 'p',
    description: 'The project path',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .parseSync();

if (!argv.path) {
    console.error("Need path argument to initialize project");
    exit(1);
}
// Try to tilde-expand the path argument
if (argv.path[0] === "~") {
    argv.path = os.homedir() + argv.path.slice(1);
}

if (argv._[0] === "init") {
    console.log("Initializing project");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const portNumber = GetRandomInt(8000, 9900);
    console.log(argv.name);
    if (!argv.name) {
        rl.question('Name of project: ', name => {
            initProject(argv.path!, name, portNumber);
        });
    } else {
        initProject(argv.path, argv.name.toString(), portNumber);
    }
    rl.close();

} else if (argv._[0] === "generate-route") {
    if (!argv.path || !argv.name || !argv.route) {
        console.error("Need project path, route for API and name for controller");
        exit(1);
    }
    let type: "Get" | "Post" = "Get";
    if (argv.type && argv.type === "Get") {
        type = "Get";
    } else if (argv.type && argv.type === "Post") {
        type = "Post";
    }
    console.log("TODO Generating code for route: ", argv.route);
    generateApiRoute(argv.path, argv.name, argv.route, type);
}

function createFolderStructure(path: string, name: string) {
    try {
        if (fs.existsSync(path + '/' + name)) {
            console.error("Folder already exists!");
            exit();
        } else {


            fs.mkdirSync(path + '/' + name);
            fs.mkdirSync(path + '/' + name + '/src');
            fs.mkdirSync(path + '/' + name + '/src/constants');
            fs.mkdirSync(path + '/' + name + '/src/controllers');
            fs.mkdirSync(path + '/' + name + '/src/engines');
            fs.mkdirSync(path + '/' + name + '/src/services');
            fs.mkdirSync(path + '/' + name + '/src/types');
            fs.mkdirSync(path + '/' + name + '/build');
            fs.mkdirSync(path + '/' + name + '/dist');
            fs.mkdirSync(path + '/' + name + '/scripts');
            fs.mkdirSync(path + '/' + name + '/static');
            fs.mkdirSync(path + '/' + name + '/prisma');
        }
    } catch (e) {
        console.error(e);
    }
}

async function initProject(path: string, name: string, port: number) {
    createFolderStructure(path, name);
    // const git = SimpleGit(path + '/' + name);
    // await git.init();

    try {
        const replaceName = new RegExp(/\$\{name\}/, 'g');
        const replacePort = new RegExp(/\$\{port\}/, 'g');

        const packageJsonTemplate = fs.readFileSync("./templates/package.json.template", { encoding: 'utf8' }).replaceAll(replaceName, name);
        const tsconfigTemplate = fs.readFileSync("./templates/tsconfig.json.template", { encoding: 'utf8' });
        const tsoaTemplate = fs.readFileSync("./templates/tsoa.json.template", { encoding: 'utf8' });
        const appTemplate = fs.readFileSync("./templates/app.ts.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const iocTemplate = fs.readFileSync("./templates/ioc.ts.template", { encoding: 'utf8' });
        const prismaTemplate = fs.readFileSync("./templates/schema.prisma.template", { encoding: 'utf8' });
        const envTemplate = fs.readFileSync("./templates/.env.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const databaseServiceTemplate = fs.readFileSync("./templates/databaseService.ts.template", { encoding: 'utf8' });
        const readmeTemplate = fs.readFileSync("./templates/README.md.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        // const gitignoreTemplate = fs.readFileSync("./templates/.gitignore.template", { encoding: 'utf8' });
        const clusterTemplate = fs.readFileSync("./templates/clister.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);;

        fs.writeFileSync(path + '/' + name + '/package.json', packageJsonTemplate);
        fs.writeFileSync(path + '/' + name + '/tsconfig.json', tsconfigTemplate);
        fs.writeFileSync(path + '/' + name + '/tsoa.json', tsoaTemplate);
        fs.writeFileSync(path + '/' + name + '/src/app.ts', appTemplate);
        fs.writeFileSync(path + '/' + name + '/src/ioc.ts', iocTemplate);
        fs.writeFileSync(path + '/' + name + '/prisma/schema.prisma', prismaTemplate);
        fs.writeFileSync(path + '/' + name + '/.env', envTemplate);
        fs.writeFileSync(path + '/' + name + '/src/services/databaseService.ts', databaseServiceTemplate);
        fs.writeFileSync(path + '/' + name + 'README.md', readmeTemplate);
        // fs.writeFileSync(path + '/' + name + '/.gitignore', gitignoreTemplate);
        fs.writeFileSync(path + '/' + name + '/cluster.json', clusterTemplate);        

        fs.openSync(path + '/' + name + '/prisma/dev.db', 'w');

        // Git stuff
        // await git.add(["package.json", "tsconfig.json", "tsoa.json", "src/", "scripts/", "prisma/", "static/", ".gitignore"]);
        // await git.commit(`Initializing project ${name}.\n\nUsing nodejs + express + tsoa + prisma`);

    } catch (e) {
        console.error(e);
    }

    console.log('Done!');
}

function generateApiRoute(projectPath: string, name: string, route: string, type: "Get" | "Post") {
    try {
        const replaceName = RegExp(/\$\{name\}/, 'g');
        const replaceRoute = RegExp(/\$\{route\}/, 'g');
        const replaceControllerName = RegExp(/\$\{controllerName\}/, 'g');
        const replaceEngineName = RegExp(/\$\{engineName\}/, 'g');
        const replaceEngineNameCapitalized = RegExp(/\$\{engineNameCapitalized\}/, 'g');
        const replaceType = RegExp(/\$\{type\}/, 'g');

        const controllerName = `${route}Controller`;
        const engineName = `${route}Engine`;

        const controllerTemplate = fs.readFileSync("./templates/controller.ts.template", { encoding: 'utf8' })
            .replaceAll(replaceName, name)
            .replaceAll(replaceRoute, route)
            .replaceAll(replaceControllerName, capitalize(controllerName))
            .replaceAll(replaceEngineName, engineName)
            .replaceAll(replaceEngineNameCapitalized, capitalize(engineName))
            .replaceAll(replaceType, type);

        const engineTemplate = fs.readFileSync("./templates/engine.ts.template", { encoding: 'utf8' })
            .replaceAll(replaceName, name)    
            .replaceAll(replaceEngineName, capitalize(engineName));

        fs.writeFileSync(projectPath + '/src/controllers/' + controllerName + '.ts', controllerTemplate);
        fs.writeFileSync(projectPath + '/src/engines/' + engineName + '.ts', engineTemplate);

    } catch (e) {
        console.error(e);
    }
}

/**
 * https://stackoverflow.com/a/1527820
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
 function GetRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
