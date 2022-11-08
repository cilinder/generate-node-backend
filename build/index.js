"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const process_1 = require("process");
const child_process_1 = require("child_process");
const yargs_1 = __importDefault(require("yargs"));
const argv = yargs_1.default
    .option("name", {
    description: "The name",
    alias: "n",
    type: "string",
})
    .option("route", {
    alias: "r",
    description: "The API route to be generated",
    type: "string",
})
    .option("type", {
    alias: "t",
    description: "Get or Post requst",
    type: "string",
})
    .help()
    .alias("help", "h")
    .parseSync();
const projectPath = process.cwd();
if (!fs_1.default.existsSync(projectPath + '/package.json')) {
    console.error("package.json file not found, please run `npm init` in the directory first to initialize npm project.");
    (0, process_1.exit)(1);
}
if (argv._[0] === "init") {
    console.log("Initializing project");
    initProject();
}
else if (argv._[0] === "generate-route") {
    if (!argv.name || !argv.route) {
        console.error("Need route for API and name for controller");
        (0, process_1.exit)(1);
    }
    let type = "Get";
    if (argv.type && argv.type === "Get") {
        type = "Get";
    }
    else if (argv.type && argv.type === "Post") {
        type = "Post";
    }
    console.log("Generating code for route: ", argv.route);
    generateApiRoute(argv.name, argv.route, type);
}
else if (argv._[0] === "generate-test-route") {
    generateApiRoute('test', 'test', 'Get');
}
function createFolderStructure(path, name) {
    try {
        fs_1.default.mkdirSync(path + '/src');
        fs_1.default.mkdirSync(path + '/src/constants');
        fs_1.default.mkdirSync(path + '/src/controllers');
        fs_1.default.mkdirSync(path + '/src/engines');
        fs_1.default.mkdirSync(path + '/src/services');
        fs_1.default.mkdirSync(path + '/src/types');
        fs_1.default.mkdirSync(path + '/build');
        fs_1.default.mkdirSync(path + '/dist');
        fs_1.default.mkdirSync(path + '/scripts');
        fs_1.default.mkdirSync(path + '/static');
        fs_1.default.mkdirSync(path + '/prisma');
    }
    catch (e) {
        console.error(e);
    }
}
async function initProject() {
    const port = GetRandomInt(8000, 9900);
    try {
        const packageJson = JSON.parse(fs_1.default.readFileSync(projectPath + '/package.json', { encoding: 'utf8' }));
        const name = packageJson.name;
        createFolderStructure(projectPath, name);
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
        fs_1.default.writeFileSync(projectPath + '/package.json', JSON.stringify(packageJson));
        console.log("Installing dependencies ....");
        const childInstall = (0, child_process_1.spawnSync)('npm', ['install']);
        const replaceName = new RegExp(/\$\{name\}/, 'g');
        const replacePort = new RegExp(/\$\{port\}/, 'g');
        const tsconfigTemplate = fs_1.default.readFileSync(__dirname + "/../templates/tsconfig.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const tsoaTemplate = fs_1.default.readFileSync(__dirname + "/../templates/tsoa.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const appTemplate = fs_1.default.readFileSync(__dirname + "/../templates/app.ts.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const iocTemplate = fs_1.default.readFileSync(__dirname + "/../templates/ioc.ts.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const prismaTemplate = fs_1.default.readFileSync(__dirname + "/../templates/schema.prisma.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const envTemplate = fs_1.default.readFileSync(__dirname + "/../templates/.env.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const databaseServiceTemplate = fs_1.default.readFileSync(__dirname + "/../templates/databaseService.ts.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const readmeTemplate = fs_1.default.readFileSync(__dirname + "/../templates/README.md.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const clusterTemplate = fs_1.default.readFileSync(__dirname + "/../templates/cluster.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const eslintrcTemplate = fs_1.default.readFileSync(__dirname + "/../templates/.eslintrc.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const prettierrcTemplate = fs_1.default.readFileSync(__dirname + "/../templates/.prettierrc.json.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const eslintignoreTemplate = fs_1.default.readFileSync(__dirname + "/../templates/.eslintignore.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const prettierignoreTemplate = fs_1.default.readFileSync(__dirname + "/../templates/.prettierignore.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        fs_1.default.writeFileSync(projectPath + '/tsconfig.json', tsconfigTemplate);
        fs_1.default.writeFileSync(projectPath + '/tsoa.json', tsoaTemplate);
        fs_1.default.writeFileSync(projectPath + '/src/app.ts', appTemplate);
        fs_1.default.writeFileSync(projectPath + '/src/ioc.ts', iocTemplate);
        fs_1.default.writeFileSync(projectPath + '/prisma/schema.prisma', prismaTemplate);
        fs_1.default.writeFileSync(projectPath + '/.env', envTemplate);
        fs_1.default.writeFileSync(projectPath + '/src/services/databaseService.ts', databaseServiceTemplate);
        fs_1.default.writeFileSync(projectPath + '/README.md', readmeTemplate);
        fs_1.default.writeFileSync(projectPath + '/cluster.json', clusterTemplate);
        fs_1.default.writeFileSync(projectPath + '/.eslintrc.json', eslintrcTemplate);
        fs_1.default.writeFileSync(projectPath + '/.prettierrc.json', prettierrcTemplate);
        fs_1.default.writeFileSync(projectPath + '/.eslintignore', eslintignoreTemplate);
        fs_1.default.writeFileSync(projectPath + '/.prettierignore', prettierignoreTemplate);
        fs_1.default.openSync(projectPath + '/prisma/dev.db', 'w');
        // Git stuff
        // await git.add(["package.json", "tsconfig.json", "tsoa.json", "src/", "scripts/", "prisma/", "static/", ".gitignore"]);
        // await git.commit(`Initializing project ${name}.\n\nUsing nodejs + express + tsoa + prisma`);
    }
    catch (e) {
        console.error(e);
    }
    console.log('Done!');
}
function generateApiRoute(name, route, type) {
    try {
        const replaceName = RegExp(/\$\{name\}/, 'g');
        const replaceRoute = RegExp(/\$\{route\}/, 'g');
        const replaceControllerName = RegExp(/\$\{controllerName\}/, 'g');
        const replaceEngineName = RegExp(/\$\{engineName\}/, 'g');
        const replaceEngineNameCapitalized = RegExp(/\$\{engineNameCapitalized\}/, 'g');
        const replaceType = RegExp(/\$\{type\}/, 'g');
        const controllerName = `${route}Controller`;
        const engineName = `${route}Engine`;
        const controllerTemplate = fs_1.default.readFileSync(__dirname + "/../templates/controller.ts.template", { encoding: 'utf8' })
            .replaceAll(replaceName, name)
            .replaceAll(replaceRoute, route)
            .replaceAll(replaceControllerName, capitalize(controllerName))
            .replaceAll(replaceEngineName, engineName)
            .replaceAll(replaceEngineNameCapitalized, capitalize(engineName))
            .replaceAll(replaceType, type);
        const engineTemplate = fs_1.default.readFileSync(__dirname + "/../templates/engine.ts.template", { encoding: 'utf8' })
            .replaceAll(replaceName, name)
            .replaceAll(replaceEngineName, capitalize(engineName));
        fs_1.default.writeFileSync(projectPath + '/src/controllers/' + controllerName + '.ts', controllerTemplate);
        fs_1.default.writeFileSync(projectPath + '/src/engines/' + engineName + '.ts', engineTemplate);
        console.log('Done!');
    }
    catch (e) {
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
function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
