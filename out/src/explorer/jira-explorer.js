"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const issue_mock_1 = require("../../test/issue.mock");
const configuration_1 = require("../shared/configuration");
const constants_1 = require("../shared/constants");
const state_1 = require("../state/state");
const divider_item_1 = require("./item/divider-item");
const filter_info_item_1 = require("./item/filter-info-item");
const issue_item_1 = require("./item/issue-item");
const limit_info_1 = require("./item/limit-info");
const loading_item_1 = require("./item/loading-item");
const no_result_item_1 = require("./item/no-result-item");
class JiraExplorer {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this._onDidChangeTreeData.fire();
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            let project = yield configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT);
            // const issues = state.issues;
            const issues = issue_mock_1.mockIssues;
            if (issues.length > 0) {
                const items = issues.map(issue => new issue_item_1.IssueItem(issue, {
                    command: 'jira-plugin.openIssueCommand',
                    title: 'Open issue in the browser',
                    arguments: [`${issue.key}`]
                }));
                items.unshift(new filter_info_item_1.FilterInfoItem(project || '', state_1.default.currentFilter, issues.length), new divider_item_1.DividerItem());
                if (issues.length === 50) {
                    items.push(new divider_item_1.DividerItem(), new limit_info_1.LimitInfoItem());
                }
                return items;
            }
            else {
                if (state_1.default.currentFilter === constants_1.LOADING.text) {
                    return [new loading_item_1.LoadingItem()];
                }
                return [new filter_info_item_1.FilterInfoItem(project || '', state_1.default.currentFilter, issues.length), new divider_item_1.DividerItem(), new no_result_item_1.NoResultItem(project || '')];
            }
        });
    }
}
exports.JiraExplorer = JiraExplorer;
//# sourceMappingURL=jira-explorer.js.map