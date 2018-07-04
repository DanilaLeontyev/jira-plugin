import 'isomorphic-fetch';
import * as vscode from 'vscode';
import { ChangeIssueAssigneeCommand } from './commands/change-issue-assignee';
import { ChangeIssueStatusCommand } from './commands/change-issue-status';
import { IssueByIdCommand } from './commands/issue-by-id';
import { IssuesByStatusAssigneeCommand } from './commands/issues-by-status-assignee';
import { MyIssuesByStatusCommand } from './commands/my-issues-by-status';
import { SetCurrentProjectCommand } from './commands/set-current-project';
import { SetupCredentialsCommand } from './commands/setup-credentials';
import { CONFIG_NAME } from './shared/constants';
import { IssueLinkProvider } from './shared/document-link-provider';
import { StatusBarManager } from './shared/status-bar';
import { executeConnectionToJira } from './shared/utils';
import state from './state/state';

let channel: vscode.OutputChannel;

export const activate = (context: vscode.ExtensionContext): void => {
  channel = vscode.window.createOutputChannel(CONFIG_NAME.toUpperCase());
  context.subscriptions.push(channel);

  const jiraLinkProvider = new IssueLinkProvider();
  vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);

  const statusBar = new StatusBarManager();
  state.context = context;
  state.channel = channel;
  state.statusBar = statusBar;
  executeConnectionToJira();

  const commands = [
    new SetupCredentialsCommand(),
    new SetCurrentProjectCommand(),
    new MyIssuesByStatusCommand(),
    new IssuesByStatusAssigneeCommand(),
    new IssueByIdCommand(),
    new ChangeIssueStatusCommand(),
    new ChangeIssueAssigneeCommand()
  ];
  context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
  context.subscriptions.push(statusBar);
};
