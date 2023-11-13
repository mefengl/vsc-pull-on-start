const vscode = require('vscode');
const { exec } = require('child_process');

function activate() {
	console.log('Extension "vsc-pull-on-start" is now active!');

	const workspaceFolders = vscode.workspace.workspaceFolders;
	vscode.window.showInformationMessage(`workspaceFolders: ${workspaceFolders}`);
	if (workspaceFolders) {
		workspaceFolders.forEach(folder => {
			const cmd = 'git pull';
			const options = { cwd: folder.uri.fsPath };

			exec(cmd, options, (error, stdout, stderr) => {
				if (error) {
					vscode.window.showErrorMessage(`Error executing git pull in ${folder.name}: ${error}`);
					return;
				}
				vscode.window.showInformationMessage(`Git pull executed in ${folder.name}: ${stdout}`);
			});
		});
	}
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};
