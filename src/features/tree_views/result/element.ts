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
import {get_icon} from "../utils";
import * as teroshdl2 from 'teroshdl2';
import {Run_output_manager} from "../run_output";


export const VIEW_ID = "teroshdl-view-result";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Elements
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class Result extends vscode.TreeItem {
    public children: any[] | undefined;
    public contextValue = "result";
    // Element
    private name: string;
    private successful: boolean;

    constructor(name: string, successful: boolean, children?: any[]) {
        super(
            name,
            children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded
        );
        // Common
        this.children = children;
        // Element
        this.name = name;
        this.successful = successful;
        if (successful === true){
            this.iconPath = get_icon("passed");
        }
        else{
            this.iconPath = get_icon("failed");
        }
    }

    get_name(){
        return this.name;
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
    private run_output_manager : Run_output_manager;

    constructor(run_output_manager : Run_output_manager) {
        super();
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
        const result_view : Result[]= [];

        const result_list = this.run_output_manager.get_results();
        result_list.forEach(result => {
            result_view.push(new Result(result.name, result.successful));
        });

        this.data = result_view;
        this._onDidChangeTreeData.fire();
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

