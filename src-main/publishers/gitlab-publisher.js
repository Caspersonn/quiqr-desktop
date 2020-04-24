
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./../environment-resolver');
const path = require('path');
const rootPath = require('electron-root-path').rootPath;

const fs = require('fs-extra');
const pathHelper = require('./../path-helper');
const outputConsole = require('./../output-console');

class GitlabPublisher {
    constructor(config){
        this._config = config;
    }

    getGitBin(){
        let enviromnent = new EnvironmentResolver().resolve();
        let platform;
        let executable;
        let cmd;
        switch(enviromnent.platform){
            case PLATFORMS.linux: { platform = 'Linux'; executable = 'embgit'; break; }
            case PLATFORMS.windows: { platform = 'Windows'; executable = 'embgit.exe'; break; }
            case PLATFORMS.macOS: { platform = 'macOS'; executable = 'embgit'; break; }
            default:{ throw new Error('Not implemented.') }
        }

        if(process.env.NODE_ENV === 'production'){
            cmd = path.join(rootPath, 'resources','bin',executable);
        }
        else{
            cmd = path.join(rootPath, 'resources',platform,executable);
        }

        return cmd;
    }

    async publish(context){

        var tmpkeypath = pathHelper.getRoot()+'ghkey';
        var resolvedDest = pathHelper.getRoot()+'sites/' + context.siteKey + '/gitlabrepo/';
        var full_gh_url = 'git@gitlab.brepi.eu:' + this._config.user + '/' + this._config.repo +'.git';
        var full_gh_dest = resolvedDest + '' + this._config.repo;
        var gitlabCi = "image: alpine:latest\n\
pages:\n\
  stage: deploy\n\
  script:\n\
  - echo 'Place everything in public'\n\
  artifacts:\n\
    paths:\n\
    - public\n\
  only:\n\
  - master\n\
pogoform:\n\
  image: 'node:latest'\n\
  script:\n\
  - echo 'INSTALL SSH AUTH'\n\
  - mkdir /root/.ssh\n\
  - echo '$SSH_PRIVATE_KEY' > /root/.ssh/id_rsa\n\
  - chmod 700 /root/.ssh\n\
  - chmod 600 /root/.ssh/id_rsa\n\
  - echo 'POPULATE KNOWN HOSTS'\n\
  - ssh-keyscan -H gitlab.lingewoud.net > /root/.ssh/known_hosts\n\
  - ssh-keyscan -H droste.node.lingewoud.net > /root/.ssh/known_hosts\n\
  - scp -r poppygo/forms pim@droste.node.lingewoud.net:/home/pim/RnD/pogoform-handler/forms/$POGOFORM_GATEWAY\n\
  only:\n\
  - master\n"

        //var gitsshcommand = 'ssh -o IdentitiesOnly=yes -i ' + tmpkeypath;
        var git_bin = this.getGitBin();

        outputConsole.appendLine('Creating empty directory at: ' + resolvedDest);

        await fs.ensureDir(resolvedDest);
        await fs.emptyDir(resolvedDest);

        await fs.ensureDir(resolvedDest);

        outputConsole.appendLine('Writing temporaty key ' + tmpkeypath);


        await fs.writeFileSync(tmpkeypath, this._config.privatekey, 'utf-8');
        await fs.chmodSync(tmpkeypath, '0600');


        outputConsole.appendLine('Start cloning from: ' + full_gh_url);

        var spawn = require("child_process").spawn;
        //let clonecmd = spawn( git_bin, [ "clone" , full_gh_url , full_gh_dest ], {env: { GIT_SSH_COMMAND: gitsshcommand }});
        let clonecmd = spawn( git_bin, [ "clone", "-i", tmpkeypath, full_gh_url , full_gh_dest ]);



        clonecmd.stdout.on("data", (data) => {
            outputConsole.appendLine('Start cloning with:' + git_bin);
        });
        clonecmd.stderr.on("data", (err) => {
            outputConsole.appendLine('Clone error ...:' + err);
        });
        clonecmd.on("exit", (code) => {
            if(code==0){
                outputConsole.appendLine('Clone succes ...');
                fs.writeFileSync(full_gh_dest + "/.gitlab-ci.yml" , gitlabCi , 'utf-8');
                fs.ensureDir(full_gh_dest + "/public");
                fs.copy(context.from, full_gh_dest + "/public",function(err){

                    outputConsole.appendLine('copy finished, going to git-add ...');

                    var spawn = require("child_process").spawn;
                    //let clonecmd2 = spawn( git_bin, [ "add" , '.'],{cwd: full_gh_dest});
                    let clonecmd2 = spawn( git_bin, [ "alladd" , full_gh_dest]);

                    clonecmd2.stdout.on("data", (data) => {
                    });
                    clonecmd2.stderr.on("data", (err) => {
                    });
                    clonecmd2.on("exit", (code) => {
                        if(code==0){

                            outputConsole.appendLine('git-add finished, going to git-commit ...');

                            var spawn = require("child_process").spawn;
                            //let clonecmd3 = spawn( git_bin, [ "commit" , '-a', '-m', 'publish from sukoh'],{cwd: full_gh_dest});
                            let clonecmd3 = spawn( git_bin, [ "commit" , '-n','sukoh','-e','sukoh@brepi.eu', '-m', 'publish from sukoh',full_gh_dest]);
                            clonecmd3.stdout.on("data", (data) => {
                            });
                            clonecmd3.stderr.on("data", (err) => {
                            });
                            clonecmd3.on("exit", (code) => {

                                if(code==0){

                                    outputConsole.appendLine('git-commit finished, going to git-push ...');

                                    var spawn = require("child_process").spawn;
                                    //let clonecmd4 = spawn( git_bin, [ "push" ], {cwd: full_gh_dest, env: { GIT_SSH_COMMAND: gitsshcommand }});
                                    let clonecmd4 = spawn( git_bin, [ "push", "-i", tmpkeypath, full_gh_dest ]);
                                    clonecmd4.stdout.on("data", (data) => {
                                    });
                                    clonecmd4.stderr.on("data", (err) => {
                                    });
                                    clonecmd4.on("exit", (err) => {

                                        if(code==0){
                                            outputConsole.appendLine('git-push finished ... changes are published.');
                                        }
                                        else{
                                            outputConsole.appendLine('ERROR: Could not git-push ...');
                                        }
                                    });
                                }
                                else {
                                    outputConsole.appendLine('ERROR: Could not git-commit ...');
                                }

                            });
                        }
                        else {
                            outputConsole.appendLine('ERROR: Could not git-add ...');
                        }
                    });
                });
            }
            else {
                outputConsole.appendLine('Could not clone destination repository');
            }
        });

        return true;
    }

}

module.exports = GitlabPublisher;
