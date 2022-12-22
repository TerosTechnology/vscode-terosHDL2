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
import { Multi_project_manager } from 'teroshdl2/out/project_manager/multi_project_manager';

export class Project_manager {
    private tree : element.ProjectProvider;
    private project_manager : Multi_project_manager;
    private project_emitter = new vscode.EventEmitter<element.Project[] | undefined>();

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(context: vscode.ExtensionContext, manager: Multi_project_manager) {
        this.set_commands();

        this.project_manager = manager;
        this.tree = new element.ProjectProvider(manager);
        
        context.subscriptions.push(vscode.window.registerTreeDataProvider(element.ProjectProvider.getViewID(), this.tree as element.BaseTreeDataProvider<element.Project>));
        vscode.commands.registerCommand("teroshdl.view.project.configuration", () => this.config());
    }

    async config() {
        vscode.commands.executeCommand("teroshdl.configuration");
    }

    set_commands(){
        vscode.commands.registerCommand("teroshdl.view.project.add", (item) => this.add_project(item));
        vscode.commands.registerCommand("teroshdl.view.project.select", (item) => this.select_project(item));
        vscode.commands.registerCommand("teroshdl.view.project.delete", (item) => this.delete_project(item));
        vscode.commands.registerCommand("teroshdl.view.project.rename", (item) => this.rename_project(item));
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Project
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async add_project(item: element.Project){
        const PROJECT_ADD_TYPES = [
            "Empty project", 
            "Load project from EDAM", 
            "Load project from VUnit run.py",
            "Load an example project"
        ];

        const picker_value = await vscode.window.showQuickPick(PROJECT_ADD_TYPES, {
            placeHolder: "Add/load a project.",
        });

        // Empty project
        if (picker_value === PROJECT_ADD_TYPES[0]) {
            vscode.window
                .showInputBox({
                    prompt: "Set the project name",
                    placeHolder: "Project name",
                })
                .then((project_name) => {
                    if (project_name !== undefined) {
                        this.project_manager.create_project(project_name);
                        this.refresh();
                    }
                });
        }
        // Load from EDAM
        else if(picker_value === PROJECT_ADD_TYPES[1]){
        }
        // Load from VUnit
        else if(picker_value === PROJECT_ADD_TYPES[2]){
        }
        // Load an example
        else if(picker_value === PROJECT_ADD_TYPES[3]){
        }
    }
    
    select_project(item: element.Project){
        this.project_manager.select_project(item.get_project_name());
        this.refresh();
    }

    delete_project(item: element.Project){
        this.project_manager.delete_project(item.get_project_name());
        this.refresh();
    }

    rename_project(item: element.Project){}

    refresh(){
        vscode.commands.executeCommand("teroshdl.view.refresh");
    }

    refresh_tree(){
        this.tree.refresh();
    }
}

