import * as vscode from 'vscode';
import { JiraExplorer } from '../explorer/jira-explorer';
import { Jira } from '../http/api';
import { IIssue, IJira, IProject, IStatus, IWorkingIssue } from '../http/api.model';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configIsCorrect, setGlobalWorkingIssue } from '../shared/configuration';
import { LOADING, NO_WORKING_ISSUE } from '../shared/constants';
import { StatusBarManager } from '../shared/status-bar';

export interface State {
  context: vscode.ExtensionContext;
  channel: vscode.OutputChannel;
  statusBar: StatusBarManager;
  jiraExplorer: JiraExplorer;
  jira: IJira;
  statuses: IStatus[];
  projects: IProject[];
  issues: IIssue[];
  currentFilter: string;
  currentJQL: string;
  workingIssue: IWorkingIssue;
}

// initial state
const state: State = {
  jira: undefined as any,
  context: undefined as any,
  channel: undefined as any,
  statusBar: undefined as any,
  jiraExplorer: undefined as any,
  statuses: [],
  projects: [],
  issues: [],
  currentFilter: LOADING.text,
  currentJQL: '',
  workingIssue: {
    issue: new NoWorkingIssuePick().pickValue,
    trackingTime: 0,
    awayTime: 0
  }
};

export default state;

export const connectToJira = async (): Promise<void> => {
  state.jira = new Jira();
  // save statuses and projects in the global state
  state.statuses = await state.jira.getStatuses();
  state.projects = await state.jira.getProjects();
};

export const canExecuteJiraAPI = (): boolean => {
  return state.jira && configIsCorrect();
};

export const verifyCurrentProject = (project: string | undefined): boolean => {
  return !!project && state.projects.filter((prj: IProject) => prj.key === project).length > 0;
};

export const changeStateIssues = (filter: string, jql: string, issues: IIssue[]): void => {
  state.currentFilter = filter;
  state.currentJQL = jql;
  state.issues = issues;
  state.jiraExplorer.refresh();
};

export const changeStateWorkingIssue = async (issue: IIssue, trackingTime: number): Promise<void> => {
  const awayTime: number = 0; // FIXME: We don't need awayTime when changing issues, not sure best way to handle this.
  state.workingIssue = { issue, trackingTime, awayTime };
  state.statusBar.updateWorkingIssueItem(false);
};

export const incrementStateWorkingIssueTimePerSecond = (): void => {
  state.workingIssue.trackingTime += 1;
  // prevent writing to much on storage
  if (state.workingIssue.trackingTime % 60 === 0) {
    if (state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
      setGlobalWorkingIssue(state.context, state.workingIssue);
    }
  }
};

// verify if it's the current working issue
export const isWorkingIssue = (issueKey: string): boolean => {
  if (issueKey === state.workingIssue.issue.key) {
    vscode.window.showErrorMessage(`Issue ${issueKey} has pending worklog. Resolve the conflict and retry the action.`);
  }
  return issueKey === state.workingIssue.issue.key;
};
