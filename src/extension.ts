// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from "ollama";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
// Function that is going to run when the extension has started
export function activate(context: vscode.ExtensionContext){
	const disposable = vscode.commands.registerCommand('CodeGenie.start',()=>{//The statement mentioned here is the statement to be mentioned in package.json
		const panel = vscode.window.createWebviewPanel(
			'deepChat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{enableScripts: true}
		)

		panel.webview.html=getWebviewContent()

		panel.webview.onDidReceiveMessage(async (message: any)=>{
		  if(message.command==='chat'){
			const userPrompt=message.text//user query
			let responseText=''//answer which is going to be returned
			try {
			  const streamResponse = await ollama.chat({
			    model: 'deepseek-coder:latest',//Model that is being used
				messages: [{ role: 'user', content: userPrompt }],
			    stream: true
			  })
			  for await (const part of streamResponse){
				responseText+=part.message.content//response from the model
				panel.webview.postMessage({command: 'chatResponse',text: part.message.content})
			  }
			}catch (err) {
			  panel.webview.postMessage({command: 'chatResponse',text:`Error: ${String(err)}`})
			}
		  }
		})
	})
	context.subscriptions.push(disposable)
}
function getWebviewContent(): string{//Frontend
	return `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
	    <meta charset="UTF-8" />
		<style>
		  body {font-family: sans-serif; margin: 1rem;}
		  #prompt {width:100%; box-sizing: border-box;}
		  #response {border: 1px solid #ccc; margin-top: 1rem; padding: 0.5rem; min-height:3rem;}
		</style>
	  </head>
	  <body>
	  	<h2>Deep VS Code Extension</h2>
		<textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br/>
		<button id="askBtn">Ask</button>
		<div id="response"></div>
		<script>
		  const vscode= acquireVsCodeApi();
		
		  document.getElementById('askBtn').addEventListener('click',()=>{
		  	document.getElementById('response').innerText ="";
		    const text = document.getElementById('prompt').value;
			vscode.postMessage({command:'chat',text});
		  })
		  window.addEventListener('message', event => {
    		const { command, text } = event.data;
    		if (command === 'chatResponse') {
			  document.getElementById('response').innerText +=text;
    		}
		  });
		</script>
	  </body>
	  </html>
	`

}
export function deactivate() {}
//Issue 1
//Once the result has been received, the data is being showcased repeatedly +distortion in the user interface
//Additional features can be added
//
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "codegenie" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	const disposable = vscode.commands.registerCommand('codegenie.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from CodeGenie!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// This method is called when your extension is deactivated
