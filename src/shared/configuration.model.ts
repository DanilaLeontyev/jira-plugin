import { WorkspaceConfiguration } from 'vscode';

export interface Configuration extends WorkspaceConfiguration {
  baseUrl?: string;
  username?: string;
  workingProject?: string;
}
