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

/* eslint-disable @typescript-eslint/class-name-casing */
import * as vscode from "vscode";
import * as element from "./element";

export class Source_manager {
    private treeview;
    private tree_data_provider: element.TreeDataProvider;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(context: vscode.ExtensionContext) {
        this.tree_data_provider = new element.TreeDataProvider();

        this.treeview = vscode.window.createTreeView("teroshdl-project", {
            showCollapseAll: true,
            treeDataProvider: this.tree_data_provider,
            canSelectMany: true,
        });

        const hdl0 = new element.Source("/mypath/module.vhd", "work", "myproject");
        const prj0 = new element.Project("Project 0", [hdl0, hdl0, hdl0]);
        const prj1 = new element.Project("Project 1", []);


        this.tree_data_provider.data = [prj0, prj1];

        vscode.commands.registerCommand("teroshdl.project.configuration", () => this.config());
    }

    async config() {
        vscode.commands.executeCommand("teroshdl.configuration");
    }
}

