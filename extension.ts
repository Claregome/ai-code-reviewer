import * as vscode from 'vscode';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand(
        'ai-code-reviewer.helloWorld',
        async () => {

            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage("No file open.");
                return;
            }

            const code = editor.document.getText();

            vscode.window.showInformationMessage("Reviewing code with AI...");

            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are a senior software engineer performing a professional code review. Provide structured feedback under: Bugs, Security Issues, Code Smells, Improvements, and Overall Score (out of 10)."
                        },
                        {
                            role: "user",
                            content: `Review this code:\n\n${code}`
                        }
                    ]
                });

                const review = response.choices[0].message?.content || "No response";

                const panel = vscode.window.createWebviewPanel(
                    'aiReview',
                    'AI Code Review',
                    vscode.ViewColumn.Beside,
                    {}
                );

                panel.webview.html = `
                    <html>
                    <body style="font-family: sans-serif; padding: 20px;">
                        <h1>AI Code Review</h1>
                        <pre>${review}</pre>
                    </body>
                    </html>
                `;

            } catch (error: any) {
                vscode.window.showErrorMessage("Error: " + error.message);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
