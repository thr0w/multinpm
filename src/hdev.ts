#!/usr/bin/node

import * as prog from 'caporal';

import { cmd_init } from './cmd_init';
import { cmd_login } from './cmd_login';
import { cmd_status } from './cmd_status';
import { cmd_clone } from './cmd_clone';
import { cmd_rm } from './cmd_rm';
import { cmd_link } from './cmd_link';
import { cmd_build } from './cmd_build';
import { cmd_start } from './cmd_watch';
import { utils } from './utils';
import { wrap } from 'bash-color';

prog.version('1.0.0')
prog.option('-v, --verbose', 'Modo deputação')

prog.command('status', 'Status dos repositorios')
    .argument('[name]', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_status));

prog.command('clone', 'Adiciona um repositorio')
    .argument('<url>', 'repositório git')
    .argument('[name]', 'Nome do pacote')
    .action(cmd(cmd_clone));

prog.command('remove', 'Remove um repositorio')
    .argument('<name>', 'Nome do pacote')
    .complete(completeWithPackageName)
    .action(cmd(cmd_rm));

prog.command('build', 'build')
    .argument('[name]', 'Nome do pacote - se não tiver o nome constroi todos')
    .complete(completeWithPackageName)
    .action(cmd(cmd_build));

prog.command('start', 'inicia o servidor de desenvolvimento')
    .complete(completeWithPackageName)
    .action(cmd(cmd_start));

prog.command('login', 'configura login do git/github')
    .argument('<name>', 'Nome de usuario no servidor')
    .argument('<email>', 'email')
    .action(cmd(cmd_login, false));

// prog.command('publish [name]')
//     .description('incrementa versao e publica pacotes')
//     .action(cmd(todo));
// prog.command('pull [name]')
//     .action(cmd(todo));
// prog.command('push [name]')
//     .action(cmd(todo));
// prog.command('watch [name]')
//     .action(cmd(todo));
// prog.command('upgrade')
//     .action(cmd(todo));
// prog.command('link')
//     .action(cmd(cmd_link));

prog.command('init', 'Inicializa na pasta atual como area de trabalho')
    .action(cmd(cmd_init));

prog.command('setup-completation', 'Configura para completar com tab')
    //.argument('<shell>', 'bash/zsh/fish', ['bash', 'zsh', 'fish'])
    .action(cmd_setup_completation);

prog.parse(process.argv);

type ActionCallback = (args: any, options: any) => Promise<boolean>;
function cmd(fn: ActionCallback, showrep = true) {
    return function (args: any, options: any) {
        utils.verbose = options.verbose;
        if (showrep)
            console.log(
                wrap('repositorio: ', "GREEN", "background")+
                wrap(utils.root, "GREEN", "background")                 
            );
        fn(args, options).then((ok: boolean) => {
            if (!ok) prog.help('hdev');
        }, console.log);
    }
}

function todo() {
    console.log('TODO')
}

async function completeWithPackageName() {
    console.log('aksfhglaksfhglahflsk')
    return Promise.resolve(utils.listPackages());
}

function cmd_setup_completation(args: any) {
    const shell = 'bash'; // args.shell
    utils.exec(process.argv[0], [process.argv[1], 'completion', shell], {
        cwd: process.cwd(),
        title: '',
    });
}