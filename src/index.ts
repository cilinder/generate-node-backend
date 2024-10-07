import { executionAsyncResource } from "async_hooks";
import fs, { read } from "fs";
import { exit } from "process";
import readline from "readline";
import { spawn, spawnSync } from 'child_process';
import os from 'os';


import yargs from 'yargs';
import SimpleGit from 'simple-git';

const argv = yargs
    .usage("$0 <cmd> [args]")
    .command("init", "Initialize a new node.js backend with express, Prisma, tsoa.")
    .command("generate-test-route", "Generate a test route, so you can see that the setup is working.")
    .command("generate-route <name> <route> <type>", "Generate a new API route", (yargs) => {
        yargs.positional("name", {
            type: "string",
            describe: "the name of the newly generated controller for the route"
        })
        .positional("route", {
            type: "string",
            describe: "the API route to be generated"
        })
        .positional("type", {
            type: "string",
            describe: "\"Get\" or \"Post\""
        })
    })
    .option("dry-run", {
        description: "run the generation without writing anything to disk",
    })
    .help()
    .alias("help", "h")
    .parseSync();

const projectPath = process.cwd();
if (!fs.existsSync(projectPath + '/package.json')) {
    console.error("package.json file not found, please run `npm init` in the directory first to initialize npm project.");
    exit(1);
}

if (argv._[0] === "init") {
    initProject(argv.dryRun as boolean | undefined);
} else if (argv._[0] === "generate-route") {
    if (!argv.name || !argv.route) {
        console.error("Need route for API and name for controller");
        exit(1);
    }
    let type: "Get" | "Post" = "Get";
    if (argv.type && argv.type === "Get") {
        type = "Get";
    } else if (argv.type && argv.type === "Post") {
        type = "Post";
    }
    console.log("Generating code for route: ", argv.route);
    generateApiRoute(argv.name as string, argv.route as string, type, argv.dryRun as boolean | undefined);
} else if (argv._[0] === "generate-test-route") {
    generateApiRoute('test', 'test', 'Get', argv.dryRun as boolean | undefined);
}

function createFolderStructure(path: string, name: string, dryRun = false) {
    try {
        if (!dryRun) {
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
        }
        console.log(`Created ${path}/src`);
        console.log(`Created ${path}/src/constants`);
        console.log(`Created ${path}/src/controllers`);
        console.log(`Created ${path}/src/engines`);
        console.log(`Created ${path}/src/services`);
        console.log(`Created ${path}/src/types`);
        console.log(`Created ${path}/build`);
        console.log(`Created ${path}/dist`);
        console.log(`Created ${path}/scripts`);
        console.log(`Created ${path}/static`);
        console.log(`Created ${path}/prisma`);
    } catch (e) {
        console.error(e);
    }
}

async function initProject(dryRun = false) {
    try {
        console.log("\x1b[34mInitializing project\x1b[0m");
        const port = GetRandomInt(8000, 9900);

        const packageJson = JSON.parse(fs.readFileSync(projectPath + '/package.json', { encoding: 'utf8' }));
        const name = packageJson.name;
        createFolderStructure(projectPath, name, dryRun);

        if (packageJson["scripts"] === undefined) {
            packageJson["scripts"] = {};
        }
        packageJson.scripts["clean"] = "rimraf dist";
        packageJson.scripts["build"] = "tsoa spec-and-routes && tsc -b";
        packageJson.scripts["dev"] = "npx nodemon --watch src/app.ts";
        packageJson.scripts["tsoa-gen"] = "tsoa routes && tsoa swagger";
        packageJson.scripts["tsoa-swagger"] = "tsoa swagger";
        packageJson.scripts["lint"] = "eslint . --ext .ts";
        packageJson.scripts["lint-and-fix"] = "eslint . --ext .ts --fix";
        packageJson.scripts["prettier-check"] = "npx prettier --check src";
        packageJson.scripts["prettier-fix"] = "npx prettier --write src";
        packageJson.scripts["update-db-schema"] = "npx prisma db push && npx prisma generate";

        packageJson.main = "src/app.ts";
        if (packageJson["dependencies"] === undefined) {
            packageJson["dependencies"] = {};
        }
        packageJson.dependencies["@prisma/client"] = "^5.20.0";
        packageJson.dependencies["compression"] = "^1.7.4";
        packageJson.dependencies["cors"] = "^2.8.5";
        packageJson.dependencies["dotenv"] = "^16.0.3";
        packageJson.dependencies["esm"] = "^3.2.25";
        packageJson.dependencies["express"] = "^4.21.0";
        packageJson.dependencies["helmet"] = "^8.0.0";
        packageJson.dependencies["rxjs"] = "^7.5.6";
        packageJson.dependencies["swagger-ui-express"] = "^5.0.1";
        packageJson.dependencies["tsoa"] = "^6.4.0";
        packageJson.dependencies["typescript-ioc"] = "^3.2.2";
        if (packageJson["devDependencies"] === undefined) {
            packageJson["devDependencies"] = {};
        }

        packageJson.devDependencies["@types/compression"] = "^1.7.2";
        packageJson.devDependencies["@types/cors"] = "^2.8.12";
        packageJson.devDependencies["@types/express"] = "^5.0.0";
        packageJson.devDependencies["@types/node"] = "^22.7.4";
        packageJson.devDependencies["@types/swagger-ui-express"] = "^4.1.3";
        packageJson.devDependencies["@typescript-eslint/eslint-plugin"] = "^8.8.0";
        packageJson.devDependencies["@typescript-eslint/parser"] = "^8.8.0";
        packageJson.devDependencies["eslint"] = "^8.57.1";
        packageJson.devDependencies["eslint-config-prettier"] = "^9.1.0";
        packageJson.devDependencies["eslint-plugin-prettier"] = "^5.2.1";
        packageJson.devDependencies["nodemon"] = "^3.1.7";
        packageJson.devDependencies["prettier"] = "^3.3.3";
        packageJson.devDependencies["prisma"] = "^5.20.0";
        packageJson.devDependencies["rimraf"] = "^6.0.1";
        packageJson.devDependencies["typescript"] = "^5.6.2";
        packageJson.devDependencies["ts-node"] = "^10.9.2";
        
        if (!dryRun) {
            fs.writeFileSync(projectPath + '/package.json', JSON.stringify(packageJson, null, 2));
        }
        console.log(`Created ${projectPath}/package.json`);
        console.log("Installing dependencies ....");
        if (!dryRun) {
            const childInstall = spawnSync('npm', ['install']);
        }

        const replaceName = new RegExp(/\$\{name\}/, 'g');
        const replacePort = new RegExp(/\$\{port\}/, 'g');

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

        if (!dryRun) {
            fs.writeFileSync(projectPath + '/tsconfig.json', tsconfigTemplate);
            fs.writeFileSync(projectPath + '/tsoa.json', tsoaTemplate);
            fs.writeFileSync(projectPath + '/src/app.ts', appTemplate);
            fs.writeFileSync(projectPath + '/src/ioc.ts', iocTemplate);
            fs.writeFileSync(projectPath + '/prisma/schema.prisma', prismaTemplate);
            fs.writeFileSync(projectPath + '/.env', envTemplate);
            fs.writeFileSync(projectPath + '/src/services/databaseService.ts', databaseServiceTemplate);
            fs.writeFileSync(projectPath + '/README.md', readmeTemplate);
            fs.writeFileSync(projectPath + '/cluster.json', clusterTemplate);
            fs.writeFileSync(projectPath + '/.eslintrc.json', eslintrcTemplate);
            fs.writeFileSync(projectPath + '/.prettierrc.json', prettierrcTemplate);
            fs.writeFileSync(projectPath + '/.eslintignore', eslintignoreTemplate);
            fs.writeFileSync(projectPath + '/.prettierignore', prettierignoreTemplate);
            fs.openSync(projectPath + '/prisma/dev.db', 'w');
        }
        console.log(`Created ${projectPath}/tsconfig.json`);
        console.log(`Created ${projectPath}/tsoa.json`);
        console.log(`Created ${projectPath}/src/app.ts`);
        console.log(`Created ${projectPath}/src/ioc.ts`);
        console.log(`Created ${projectPath}/prisma/schema.prisma`);
        console.log(`Created ${projectPath}/.env',`);
        console.log(`Created ${projectPath}/src/services/databaseService.ts`);
        console.log(`Created ${projectPath}/README.md`);
        console.log(`Created ${projectPath}/cluster.json`);
        console.log(`Created ${projectPath}/.eslintrc.json`);
        console.log(`Created ${projectPath}/.prettierrc.json`);
        console.log(`Created ${projectPath}/.eslintignore`);
        console.log(`Created ${projectPath}/.prettierignore`);
        console.log(`Created ${projectPath}/prisma/dev.db`);

        // Git stuff, check if folder already has a .git folder otherwise initialize git in the folder
        if (!fs.existsSync(projectPath + '/.git')) {
            if (!dryRun) {
                const git = SimpleGit(projectPath);
                await git.init();
                const gitignoreTemplate = fs.readFileSync(__dirname + "/../templates/.gitignore.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
                fs.writeFileSync(projectPath + '/.gitignore', gitignoreTemplate);
                await git.add(["package.json", "package-lock.json", "tsconfig.json", "tsoa.json", "src/", "scripts/", "prisma/", "static/", ".gitignore", ".eslintignore", ".eslintrc.json", ".prettierignore", ".prettierrc.json", "README.md", "cluster.json"]);
                await git.commit(`Initializing project ${name}.\n\nUsing nodejs + express + tsoa + prisma`);
            }
            console.log("Initialized git");
            console.log("Created .gitignore");
        }

        console.log('\x1b[32mInitialization done!\x1b[0m You can generate a test API route with `npx gnb generate-test-route` or use `npx gnb generate-route <name> <route> <type>`.\nYou can run the project with `npm run dev` and it will be visible at http://localhost:' + port.toString() + '.');
        if (dryRun) {
            console.log('\x1b[43mThe command was run in dry-run mode, no files were written to disk.\x1b[0m');
        }
    } catch (e) {
        console.error('Initialization failed\n', e);
    }

}

function generateApiRoute(name: string, route: string, type: "Get" | "Post", dryRun = false) {
    try {
        console.log(`\x1b[34mGenerating new API route api/${name}/${route}\x1b[0m`);
        const replaceName = RegExp(/\$\{name\}/, 'g');
        const replaceRoute = RegExp(/\$\{route\}/, 'g');
        const replaceControllerName = RegExp(/\$\{controllerName\}/, 'g');
        const replaceEngineName = RegExp(/\$\{engineName\}/, 'g');
        const replaceEngineNameCapitalized = RegExp(/\$\{engineNameCapitalized\}/, 'g');
        const replaceType = RegExp(/\$\{type\}/, 'g');

        const controllerName = `${route}Controller`;
        const engineName = `${route}Engine`;

        const controllerTemplate = fs.readFileSync(__dirname + "/../templates/controller.ts.template", { encoding: 'utf8' })
            .replaceAll(replaceName, name)
            .replaceAll(replaceRoute, route)
            .replaceAll(replaceControllerName, capitalize(controllerName))
            .replaceAll(replaceEngineName, engineName)
            .replaceAll(replaceEngineNameCapitalized, capitalize(engineName))
            .replaceAll(replaceType, type);

        const engineTemplate = fs.readFileSync(__dirname + "/../templates/engine.ts.template", { encoding: 'utf8' })
            .replaceAll(replaceName, name)    
            .replaceAll(replaceEngineName, capitalize(engineName));

        if (!dryRun) {
            fs.writeFileSync(projectPath + '/src/controllers/' + controllerName + '.ts', controllerTemplate);
            fs.writeFileSync(projectPath + '/src/engines/' + engineName + '.ts', engineTemplate);
        }
        console.log(`Created ${projectPath}/src/controllers/${controllerName}.ts`);
        console.log(`Created ${projectPath}/src/engines/${engineName}.ts`);
        console.log(`Created new API route, available on BASE_URL/api/${name}/${route}.`);
        if (dryRun) {
            console.log('\x1b[43mThe command was run in dry-run mode, no files were written to disk.\x1b[0m');
        }
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
