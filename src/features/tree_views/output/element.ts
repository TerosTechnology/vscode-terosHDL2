// Copyright 2022 
// Carlos Alberto Ruiz Naranjo [carlosruiznaranjo@gmail.com]
//
// This file is part of teroshdl
//
// Colibri is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Colibri is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with teroshdl. If not, see <https://www.gnu.org/licenses/>.

import { Multi_project_manager } from "teroshdl2/out/project_manager/multi_project_manager";
import * as vscode from "vscode";
import { get_icon } from "../utils";
import * as teroshdl2 from 'teroshdl2';
import { Run_output_manager } from "../run_output";

export const VIEW_ID = "teroshdl-view-runs";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Elements
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class Output extends vscode.TreeItem {
    public children: any[] | undefined;
    public contextValue = "output";
    // Element
    private name: string;
    private path: string;

    constructor(name: string, path: string, type: teroshdl2.project_manager.tool_common.e_artifact_type
        , children?: any[]) {

        super(
            name,
            children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded
        );

        // Common
        this.children = children;
        // Element
        this.name = name;
        this.path = path;

        if (type === teroshdl2.project_manager.tool_common.e_artifact_type.HTML) {
            this.iconPath = get_icon("globe");
            this.command = {
                title: 'Open file',
                command: 'teroshdl.open',
                arguments: [vscode.Uri.file(path)]
            };
        }
        else {
            this.iconPath = get_icon("file");
            this.command = {
                title: 'Open file',
                command: 'vscode.open',
                arguments: [vscode.Uri.file(path)]
            };
        }

    }

    get_name() {
        return this.name;
    }

    get_path() {
        return this.path;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Providers
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export abstract class BaseTreeDataProvider<T> implements vscode.TreeDataProvider<T> {
    static getViewID(): string {
        throw new Error('Not implemented.');
    }

    abstract getTreeItem(element: T): vscode.TreeItem | Thenable<vscode.TreeItem>;
    abstract getChildren(element?: T | undefined): vscode.ProviderResult<T[]>;
}

export class ProjectProvider extends BaseTreeDataProvider<TreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

    data: TreeItem[] = [];
    private project_manager: Multi_project_manager;
    private run_output_manager: Run_output_manager;

    constructor(project_manager: Multi_project_manager, run_output_manager: Run_output_manager) {
        super();
        this.project_manager = project_manager;
        this.run_output_manager = run_output_manager;
    }

    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }

    static getViewID() {
        return VIEW_ID;
    }

    async refresh(): Promise<void> {
        const selected_project = this.project_manager.get_select_project();
        if (selected_project.successful === false) {
            this.data = [];
            this._onDidChangeTreeData.fire();
            return;
        }

        const runs_view: Output[] = [];

        const result_list = this.run_output_manager.get_results();
        result_list.forEach(result => {
            result.artifact.forEach(artifact => {
                runs_view.push(new Output(artifact.name, artifact.path, artifact.type));
            });
        });

        this.data = runs_view;
        this._onDidChangeTreeData.fire();
    }

    get_successful(name: string) {
        let successful: boolean | undefined = undefined;
        let time: number | undefined = undefined;

        const result_list = this.run_output_manager.get_results();
        result_list.forEach(result => {
            if (result.name === name) {
                successful = result.successful;
                time = result.time;
            }
        });
        return { successful: successful, time: time };
    }
}

export class TreeItem extends vscode.TreeItem {
    children: TreeItem[] | undefined;

    constructor(label: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None :
                vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
    }
}

