const { exec } = require('node:child_process');
const vscode = require('vscode');

function activate() {
  console.log('Extension "vsc-pull-on-start" is now active!');

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    workspaceFolders.forEach((folder) => {
      const gitFolderCheckCmd = 'git rev-parse --is-inside-work-tree';
      const gitRemoteCheckCmd = 'git remote';
      const options = { cwd: folder.uri.fsPath };

      exec(gitFolderCheckCmd, options, (error, isGitRepo) => {
        if (error || isGitRepo.trim() !== 'true') {
          console.log(`${folder.name} is not a Git repository.`);
          return;
        }

        exec(gitRemoteCheckCmd, options, (error, hasRemote) => {
          if (error || !hasRemote.trim()) {
            console.log(`No remote found for the Git repository in ${folder.name}.`);
            return;
          }

          const tryPull = (attempt = 1) => {
            const delay = Math.pow(2, attempt - 1) * 1000; // 2 seconds, 4 seconds, 8 seconds
            setTimeout(() => {
              exec('git pull', options, (error, stdout) => {
                if (error) {
                  if (attempt < 3) {
                    tryPull(attempt + 1);
                  } else {
                    vscode.window.showErrorMessage(`Error executing git pull in ${folder.name}: ${error}`);
                  }
                  return;
                }
                if (!vscode.workspace.getConfiguration('pullOnStart').get('silence'))
                  vscode.window.showInformationMessage(`Git pull executed in ${folder.name}: ${stdout}`);
              });
            }, delay);
          };

          tryPull(); // Initiate the first pull attempt
        });
      });
    });
  }
}

function deactivate() { }

module.exports = {
  activate,
  deactivate,
};
