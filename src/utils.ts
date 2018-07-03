import * as vscode from 'vscode';
import { Assignee, Issue } from './api.model';
import { CONFIG, getConfigurationByKey } from './configuration';
import state, { canExecuteJiraAPI } from './state';

export const selectProject = async (): Promise<string> => {
  if (canExecuteJiraAPI()) {
    const picks = state.projects.map(project => ({
      label: project.key,
      description: project.name
    }));
    const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Set current project`, matchOnDescription: true });
    return selected ? selected.label : '';
  }
  return '';
};

export const selectStatus = async (): Promise<string> => {
  if (canExecuteJiraAPI()) {
    const picks = state.statuses.map(status => ({
      label: status.name,
      description: status.description
    }));
    const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Filter by STATUS`, matchOnDescription: true });
    return selected ? selected.label : '';
  }
  return '';
};

export const selectIssue = async (): Promise<string | undefined> => {
  if (canExecuteJiraAPI()) {
    const currentProject = getConfigurationByKey(CONFIG.CURRENT_PROJECT);
    const status = await selectStatus();
    if (!!status) {
      const issues = await state.jira.search({
        jql: `project in (${currentProject}) AND status = '${status}' AND assignee in (currentUser()) ORDER BY updated DESC`
      });
      const picks = (issues.issues || []).map((issue: Issue) => {
        return {
          issue,
          label: issue.key,
          description: issue.fields.summary,
          detail: issue.fields.description
        };
      });
      if (picks.length > 0) {
        const selected = await vscode.window.showQuickPick(picks, {
          matchOnDescription: true,
          matchOnDetail: true,
          placeHolder: 'Select an issue'
        });
        return selected ? selected.label : undefined;
      } else {
        vscode.window.showInformationMessage(`No issues found: project - ${currentProject} | status - ${status}`);
      }
    }
  }
  return undefined;
};

export const selectAssignee = async (): Promise<string> => {
  const project = getConfigurationByKey(CONFIG.CURRENT_PROJECT) || '';
  const assignees = await state.jira.getAssignees(`search?project=${project}`);
  const picks = (assignees || []).filter((assignee: Assignee) => assignee.active === true).map((assignee: Assignee) => {
    return {
      label: assignee.key,
      description: assignee.displayName,
      detail: '',
      assignee
    };
  });
  const selected = await vscode.window.showQuickPick(picks, {
    matchOnDescription: true,
    matchOnDetail: true,
    placeHolder: 'Select an issue'
  });
  return selected ? selected.assignee.key : '';
};
