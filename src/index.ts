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

if (argv._[0] === "init") {
    console.log("Initializing project");
    initProject();
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
        fs.mkdirSync(path + '/src');
        fs.mkdirSync(path + '/src/constants');
        fs.mkdirSync(path + '/src/controllers');
        fs.mkdirSync(path + '/src/engines');
        fs.mkdirSync(path + '/src/services');
        fs.mkdirSync(path + '/src/types');
        fs.mkdirSync(path + '/build');
        fs.mkdirSync(path + '/dist');
        fs.mkdirSync(path + '/scripts');
        fs.mkdirSync(path + '/static');
        fs.mkdirSync(path + '/prisma');
    } catch (e) {
        console.error(e);
    }
}

async function initProject() {
    const port = GetRandomInt(8000, 9900);
    try {
        const path = process.cwd();
        if (!fs.existsSync(path + '/package.json')) {
            console.error("package.json file not found, please run `npm init` in the directory first to initialize npm project.");
            exit(1);
        }
        const packageJson = JSON.parse(fs.readFileSync(path + '/package.json', { encoding: 'utf8' }));
        const name = packageJson.name;
        console.log(path, name);
        createFolderStructure(path, name);
        
        // const git = SimpleGit(path + '/' + name);
        // await git.init();
        // const gitignoreTemplate = fs.readFileSync("./templates/.gitignore.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        // fs.writeFileSync(path + '/.gitignore', gitignoreTemplate);
        if (packageJson["scripts"] === undefined) {
            packageJson["scripts"] = {};
        }
        packageJson.scripts["build"] = "rimraf dist/* && tsoa spec-and-routes && tsc";
        packageJson.scripts["dev"] = "npm run build && nodemon src/app.ts";
        packageJson.scripts["tsoa-gen"] = "tsoa routes && tsoa swagger";
        packageJson.scripts["tsoa-swagger"] = "tsoa swagger";
        packageJson.scripts["lint"] = "eslint . --ext .ts";
        packageJson.scripts["lint-and-fix"] = "eslint . --ext .ts --fix";
        packageJson.scripts["prettier-check"] = "npx prettier --check src";
        packageJson.scripts["prettier-fix"] = "npx prettier --write src";
        packageJson.scripts["pm2"] = "pm2";
        packageJson.scripts["start"] = "pm2 start cluster.json";
        packageJson.scripts["stop"] = "pm2 kill";
        packageJson.scripts["monit"] = "pm2 monit";
        packageJson.scripts["update-db-schema"] = "npx prisma db push && npx prisma generate";

        packageJson.main = "src/app.ts";
        if (packageJson["dependencies"] === undefined) {
            packageJson["dependencies"] = {};
        }
        packageJson.dependencies["@prisma/client"] = "^4.5.0";
        packageJson.dependencies["compression"] = "^1.7.4";
        packageJson.dependencies["cors"] = "^2.8.5";
        packageJson.dependencies["dotenv"] = "^16.0.3";
        packageJson.dependencies["esm"] = "^3.2.25";
        packageJson.dependencies["express"] = "^4.18.1";
        packageJson.dependencies["helmet"] = "^4.2.0";
        packageJson.dependencies["nodemon"] = "^2.0.19";
        packageJson.dependencies["pm2"] = "5.2.0";
        packageJson.dependencies["rxjs"] = "^7.5.6";
        packageJson.dependencies["swagger-ui-express"] = "^4.5.0";
        packageJson.dependencies["ts-node"] = "^10.9.1";
        packageJson.dependencies["tsoa"] = "^4.1.2";
        packageJson.dependencies["typescript"] = "^4.8.3";
        packageJson.dependencies["typescript-ioc"] = "^3.2.2";
        if (packageJson["devDependencies"] === undefined) {
            packageJson["devDependencies"] = {};
        }
        packageJson.devDependencies["@types/compression"] = "^1.7.2";
        packageJson.devDependencies["@types/cors"] = "^2.8.12";
        packageJson.devDependencies["@types/express"] = "^4.17.14";
        packageJson.devDependencies["@types/node"] = "^18.7.18";
        packageJson.devDependencies["@types/swagger-ui-express"] = "^4.1.3";
        packageJson.devDependencies["@typescript-eslint/eslint-plugin"] = "^5.37.0";
        packageJson.devDependencies["@typescript-eslint/parser"] = "^5.37.0";
        packageJson.devDependencies["eslint"] = "^8.23.1";
        packageJson.devDependencies["eslint-config-prettier"] = "^8.5.0";
        packageJson.devDependencies["eslint-plugin-prettier"] = "^4.0.0";
        packageJson.devDependencies["prettier"] = "^2.7.1";
        packageJson.devDependencies["prisma"] = "^4.5.0";
        packageJson.devDependencies["rimraf"] = "^3.0.2";
        
        fs.writeFileSync(path + '/package.json', JSON.stringify(packageJson));
        console.log("npm install ....");
        const childInstall = spawn('npm', ['install']);

        // const childPrismaClinet = spawn('npm', ['install', 'prisma']);
        // const childCompression = spawn('npm', ['install', 'compression']);
        // const childCors = spawn('npm', ['install', 'cors']);
        // const childDotenv = spawn('npm', ['install', 'dotenv']);
        // const childEsm = spawn('npm', ['install', 'esm']);
        // const childExpress = spawn('npm', ['install', 'express']);
        // const childHelmet = spawn('npm', ['install', 'helmet']);
        // const childNodemon = spawn('npm', ['install', 'nodemon']);
        // const childPm2 = spawn('npm', ['install', 'pm2']);
        // const childRxjs = spawn('npm', ['install', 'rxjs']);
        // const childSwaggerUI = spawn('npm', ['install', 'swagger-ui-express']);
        // const childTsNode = spawn('npm', ['install', 'ts-node']);
        // const childTsoa = spawn('npm', ['install', 'tsoa']);
        // const childTypescript = spawn('npm', ['install', 'typescript']);
        // const childTypescriptIoc = spawn('npm', ['install', 'typescript-ioc']);

        // const childTypesCompression = spawn('npm', ['install', '--save-dev', '@types/compression']);
        // const childTypesCors = spawn('npm', ['install', '--save-dev', '@types/cors']);
        // const childTypesExpress = spawn('npm', ['install', '--save-dev', '@types/express']);
        // const childTypesNode = spawn('npm', ['install', '--save-dev', '@types/node']);
        // const childTypesSwaggerUI = spawn('npm', ['install', '--save-dev', '@types/swagger-ui-express']);
        // const childTypescriptEslintPlugin = spawn('npm', ['install', '--save-dev', '@typescript-eslint/eslint-plugin']);
        // const childTypescriptEslintParser = spawn('npm', ['install', '--save-dev', '@typescript-eslint/parser']);
        // const childEslint = spawn('npm', ['install', '--save-dev', 'eslint']);
        // const childEslintConfigPrettier = spawn('npm', ['install', '--save-dev', 'eslint-config-prettier']);
        // const childEslintPluginPrettier = spawn('npm', ['install', '--save-dev', 'eslint-plugin-prettier']);
        // const childPrettier = spawn('npm', ['install', '--save-dev', 'prettier']);
        // const childPrisma = spawn('npm', ['install', '--save-dev', 'prisma']);
        // const childRimraf = spawn('npm', ['install', '--save-dev', 'rimraf']);

        const replaceName = new RegExp(/\$\{name\}/, 'g');
        const replacePort = new RegExp(/\$\{port\}/, 'g');

        console.log(__dirname);

        const tsconfigTemplate = fs.readFileSync(__dirname + "/../templates/tsconfig.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const tsoaTemplate = fs.readFileSync(__dirname + "/../templates/tsoa.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const appTemplate = fs.readFileSync(__dirname + "/../templates/app.ts.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const iocTemplate = fs.readFileSync(__dirname + "/../templates/ioc.ts.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const prismaTemplate = fs.readFileSync(__dirname + "/../templates/schema.prisma.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const envTemplate = fs.readFileSync(__dirname + "/../templates/.env.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const databaseServiceTemplate = fs.readFileSync(__dirname + "/../templates/databaseService.ts.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const readmeTemplate = fs.readFileSync(__dirname + "/../templates/README.md.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const clusterTemplate = fs.readFileSync(__dirname + "/../templates/cluster.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const eslintrcTemplate = fs.readFileSync(__dirname + "/../templates/.eslintrc.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const prettierrcTemplate = fs.readFileSync(__dirname + "/../templates/.prettierrc.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const eslintignoreTemplate = fs.readFileSync(__dirname + "/../templates/.eslintignore.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const prettierignoreTemplate = fs.readFileSync(__dirname + "/../templates/.prettierignore.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);

        fs.writeFileSync(path + '/tsconfig.json', tsconfigTemplate);
        fs.writeFileSync(path + '/tsoa.json', tsoaTemplate);
        fs.writeFileSync(path + '/src/app.ts', appTemplate);
        fs.writeFileSync(path + '/src/ioc.ts', iocTemplate);
        fs.writeFileSync(path + '/prisma/schema.prisma', prismaTemplate);
        fs.writeFileSync(path + '/.env', envTemplate);
        fs.writeFileSync(path + '/src/services/databaseService.ts', databaseServiceTemplate);
        fs.writeFileSync(path + '/README.md', readmeTemplate);
        fs.writeFileSync(path + '/cluster.json', clusterTemplate);
        fs.writeFileSync(path + '/.eslintrc.json', eslintrcTemplate);
        fs.writeFileSync(path + '/.prettierrc.json', prettierrcTemplate);
        fs.writeFileSync(path + '/.eslintignore', eslintignoreTemplate);
        fs.writeFileSync(path + '/.prettierignore.json', prettierignoreTemplate);

        fs.openSync(path + '/prisma/dev.db', 'w');

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
