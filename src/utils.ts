import { readdirSync, readFileSync, existsSync } from "fs"
import { dirname, basename, join } from "path"
import { spawnSync } from "child_process"
import * as pm2 from 'pm2';
import { red, blue } from "bash-color";

export type PackageJSON = {
    name: string;
    dependencies?: string[],
    devDependencies?: string[],
    peerDependencies?: string[],
}
export type WorkspaceFile = {
    "folders": { path: string }[],
    settings: Object
}

pm2.connect(function (err) {
    if (err) {
        console.error(err);
        process.exit(2);
    }
});

export const utils = {
    get root() {
        return root;
    },
    get workspaceFile() {
        return join(root, + basename(root) + '.code-workspace');
    },
    adaptFolderName(packageName: string) {
        if (packageName.indexOf('-') != -1)
            utils.throw('Invalid package name ' + packageName)
        return packageName.replace('/', '-');
    },
    listPackages() {
        const dir = root + '/packages';
        if (!existsSync(dir)) return [];
        return readdirSync(dir);
    },
    forEachPackage(fn: (packagName: string, folder: string) => void) {
        utils.listPackages().forEach((p) => {
            fn(p.replace('-', '/'), [root, 'packages', p].join('/'));
        })
    },
    getPackageJsonFor(packagName: string) {
        const json = utils.readJSON<PackageJSON>(packagName, 'package.json');
        if (json.name !== packagName)
            utils.throw(
                'Package name (' + packagName +
                ') é diferente do que está em name do package.json (' +
                json.name + ')');
        return json;
    },
    path(packageName: string, filename = '') {
        return join(root, 'packages', utils.adaptFolderName(packageName), filename);
    },
    exists(packageName: string, filename: string): boolean {
        return existsSync(utils.path(packageName, filename));
    },
    readText(packageName: string, filename: string): string {
        return readFileSync(
            utils.path(packageName, filename),
            { encoding: 'utf-8' }
        );
    },
    readJSON<T>(packageName: string, filename: string): T {
        return JSON.parse(utils.readText(packageName, filename)) as T;
    },
    throw(msg: string) {
        console.log(msg)
        process.exit(1)
    },
    exec(cmd: string, args: string[], opts: { cwd: string }) {
        console.log(
            red(opts.cwd + '$ ') +
            blue(cmd + ' ' + args.join(' '), true)
        );
        const r = spawnSync(
            cmd, args,
            {
                ...opts,
                stdio: ['inherit', 'inherit', 'inherit']
            }
        );
        if (r.status != 0)
            process.exit(1);
    }
}
const root = findRoot(process.cwd())

function findRoot(folder: string) {
    while (folder && folder != '/') {
        const files = readdirSync(folder);
        const w = basename(folder) + '.code-workspace';
        if (files.some((f) => f == w)) {
            return folder;
        }
        folder = dirname(folder);
    }
    utils.throw('no code-workspace file found')
    return ''
}
