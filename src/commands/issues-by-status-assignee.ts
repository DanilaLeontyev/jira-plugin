import { bind } from 'decko';
import * as vscode from 'vscode';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG, SEARCH_MODE } from '../shared/constants';
import { selectIssue } from '../shared/select-utilities';
import { Command } from './shared/command';

export class IssuesByStatusAssigneeCommand implements Command {
  public id = 'jira-plugin.issuesByStatusAssigneeCommand';

  @bind
  public async run(): Promise<void> {
    const issue = await selectIssue(SEARCH_MODE.STATUS_ASSIGNEE);
    if (issue) {
      const url = `${getConfigurationByKey(CONFIG.BASE_URL)}/browse/${issue}`;
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  }
}
