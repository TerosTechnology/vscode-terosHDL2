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

import * as vscode from "vscode";
import * as path_lib from "path";
import {get_icon} from "../utils";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Elements
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class Project extends vscode.TreeItem {
    public children: any[] | undefined;
    public iconPath = get_icon("project");
    public contextValue = "project";
    // Element
    public project_name: string;

    constructor(project_name: string, children?: any[]) {
        super(
            project_name,
            children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded
        );
        // Common
        this.children = children;
        // Element
        this.project_name = project_name;
    }
}

export class Source extends vscode.TreeItem {
    public children: any[] | undefined;
    public iconPath = get_icon("file");
    public contextValue = "source";
    public tooltip?: string | vscode.MarkdownString | undefined;
    public description?: string | boolean | undefined;
    // Element
    public path: string;
    public library_name: string;
    public project_name: string;

    constructor(path: string, library_name: string, project_name: string) {
        const dirname = path_lib.dirname(path);
        const basename = path_lib.basename(path);
        super(basename);
        // Common
        this.description = dirname;
        this.tooltip = path;
        // Element
        this.path = path;
        this.library_name = library_name;
        this.project_name = project_name;
    }
}

export class Library extends vscode.TreeItem {
    public children: any[] | undefined;
    public iconPath = get_icon("library");
    public contextValue = "library";
    public collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    // Element
    public library_name: string;
    public project_name: string;

    constructor(library_name: string, project_name: string, children?: Source[]) {
        super(
            library_name,
            children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded
        );
        // Common
        this.children = children;
        // Element
        this.project_name = project_name;
        this.library_name = library_name;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Providers
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    onDidChangeTreeData?: vscode.Event<TreeItem | null | undefined> | undefined;

    data: TreeItem[];

    constructor() {
        this.data = [];
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