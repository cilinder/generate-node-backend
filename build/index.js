"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const process_1 = require("process");
const readline_1 = __importDefault(require("readline"));
const os_1 = __importDefault(require("os"));
const yargs_1 = __importDefault(require("yargs"));
const simple_git_1 = __importDefault(require("simple-git"));
const argv = yargs_1.default
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
    (0, process_1.exit)(1);
}
// Try to tilde-expand the path argument
if (argv.path[0] === "~") {
    argv.path = os_1.default.homedir() + argv.path.slice(1);
}
if (argv._[0] === "init") {
    console.log("Initializing project");
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const portNumber = GetRandomInt(8000, 9900);
    console.log(argv.name);
    if (!argv.name) {
        rl.question('Name of project: ', name => {
            initProject(argv.path, name, portNumber);
        });
    }
    else {
        initProject(argv.path, argv.name.toString(), portNumber);
    }
    rl.close();
}
else if (argv._[0] === "generate-route") {
    if (!argv.path || !argv.name || !argv.route) {
        console.error("Need project path, route for API and name for controller");
        (0, process_1.exit)(1);
    }
    let type = "Get";
    if (argv.type && argv.type === "Get") {
        type = "Get";
    }
    else if (argv.type && argv.type === "Post") {
        type = "Post";
    }
    console.log("TODO Generating code for route: ", argv.route);
    generateApiRoute(argv.path, argv.name, argv.route, type);
}
function createFolderStructure(path, name) {
    try {
        if (fs_1.default.existsSync(path + '/' + name)) {
            console.error("Folder already exists!");
            (0, process_1.exit)();
        }
        else {
            fs_1.default.mkdirSync(path + '/' + name);
            fs_1.default.mkdirSync(path + '/' + name + '/src');
            fs_1.default.mkdirSync(path + '/' + name + '/src/constants');
            fs_1.default.mkdirSync(path + '/' + name + '/src/controllers');
            fs_1.default.mkdirSync(path + '/' + name + '/src/engines');
            fs_1.default.mkdirSync(path + '/' + name + '/src/services');
            fs_1.default.mkdirSync(path + '/' + name + '/src/types');
            fs_1.default.mkdirSync(path + '/' + name + '/build');
            fs_1.default.mkdirSync(path + '/' + name + '/dist');
            fs_1.default.mkdirSync(path + '/' + name + '/scripts');
            fs_1.default.mkdirSync(path + '/' + name + '/static');
            fs_1.default.mkdirSync(path + '/' + name + '/prisma');
        }
    }
    catch (e) {
        console.error(e);
    }
}
async function initProject(path, name, port) {
    createFolderStructure(path, name);
    const git = (0, simple_git_1.default)(path + '/' + name);
    await git.init();
    try {
        const replaceName = new RegExp(/\$\{name\}/, 'g');
        const replacePort = new RegExp(/\$\{port\}/, 'g');
        const packageJsonTemplate = fs_1.default.readFileSync("./templates/package.json.template", { encoding: 'utf8' }).replaceAll(replaceName, name);
        const tsconfigTemplate = fs_1.default.readFileSync("./templates/tsconfig.json.template", { encoding: 'utf8' });
        const tsoaTemplate = fs_1.default.readFileSync("./templates/tsoa.json.template", { encoding: 'utf8' });
        const appTemplate = fs_1.default.readFileSync("./templates/app.ts.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const iocTemplate = fs_1.default.readFileSync("./templates/ioc.ts.template", { encoding: 'utf8' });
        const prismaTemplate = fs_1.default.readFileSync("./templates/schema.prisma.template", { encoding: 'utf8' });
        const envTemplate = fs_1.default.readFileSync("./templates/.env.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString());
        const databaseServiceTemplate = fs_1.default.readFileSync("./templates/databaseService.ts.template", { encoding: 'utf8' });
        const readmeTemplate = fs_1.default.readFileSync("./templates/README.md.template", { encoding: 'utf8' }).replaceAll(replacePort, port.toString()).replaceAll(replaceName, name);
        const gitignoreTemplate = fs_1.default.readFileSync("./templates/.gitignore.template", { encoding: 'utf8' });
        fs_1.default.writeFileSync(path + '/' + name + '/package.json', packageJsonTemplate);
        fs_1.default.writeFileSync(path + '/' + name + '/tsconfig.json', tsconfigTemplate);
        fs_1.default.writeFileSync(path + '/' + name + '/tsoa.json', tsoaTemplate);
        fs_1.default.writeFileSync(path + '/' + name + '/src/app.ts', appTemplate);
        fs_1.default.writeFileSync(path + '/' + name + '/src/ioc.ts', iocTemplate);
        fs_1.default.writeFileSync(path + '/' + name + '/prisma/schema.prisma', prismaTemplate);
        fs_1.default.writeFileSync(path + '/' + name + '/.env', envTemplate);
        fs_1.default.writeFileSync(path + '/' + name + '/src/services/databaseService.ts', databaseServiceTemplate);
        fs_1.default.writeFileSync(path + '/' + name + 'README.md', readmeTemplate);
        fs_1.default.writeFileSync(path + '/' + name + '/.gitignore', gitignoreTemplate);
        fs_1.default.openSync(path + '/' + name + '/prisma/dev.db', 'w');
        // Git stuff
        await git.add(["package.json", "tsconfig.json", "tsoa.json", "src/", "scripts/", "prisma/", "static/", ".gitignore"]);
        await git.commit(`Initializing project ${name}.\n\nUsing nodejs + express + tosa + prisma`);
    }
    catch (e) {
        console.error(e);
    }
    console.log('Done!');
}
function generateApiRoute(projectPath, name, route, type) {
    try {
        const replaceName = RegExp(/\$\{name\}/, 'g');
        const replaceRoute = RegExp(/\$\{route\}/, 'g');
        const replaceControllerName = RegExp(/\$\{controllerName\}/, 'g');
        const replaceEngineName = RegExp(/\$\{engineName\}/, 'g');
        const replaceEngineNameCapitalized = RegExp(/\$\{engineNameCapitalized\}/, 'g');
        const replaceType = RegExp(/\$\{type\}/, 'g');
        const controllerName = `${route}Controller`;
        const engineName = `${route}Engine`;
        const controllerTemplate = fs_1.default.readFileSync("./templates/controller.ts.template", { encoding: 'utf8' })
            .replaceAll(replaceName, name)
            .replaceAll(replaceRoute, route)
            .replaceAll(replaceControllerName, capitalize(controllerName))
            .replaceAll(replaceEngineName, engineName)
            .replaceAll(replaceEngineNameCapitalized, capitalize(engineName))
            .replaceAll(replaceType, type);
        const engineTemplate = fs_1.default.readFileSync("./templates/engine.ts.template", { encoding: 'utf8' })
            .replaceAll(replaceName, name)
            .replaceAll(replaceEngineName, capitalize(engineName));
        fs_1.default.writeFileSync(projectPath + '/src/controllers/' + controllerName + '.ts', controllerTemplate);
        fs_1.default.writeFileSync(projectPath + '/src/engines/' + engineName + '.ts', engineTemplate);
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
