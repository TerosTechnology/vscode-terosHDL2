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
import * as events from "events";
import * as teroshdl2 from 'teroshdl2';
import {Results_manager} from "../results";

export class Runs_manager {
    private tree : element.ProjectProvider;
    private project_manager : Multi_project_manager;
    private emitter : events.EventEmitter;
    private results_manager : Results_manager;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(context: vscode.ExtensionContext, manager: Multi_project_manager, emitter : events.EventEmitter,
        results_manager: Results_manager) {

        this.set_commands();

        this.results_manager = results_manager;
        this.emitter = emitter;
        this.project_manager = manager;
        this.tree = new element.ProjectProvider(manager);
        
        context.subscriptions.push(vscode.window.registerTreeDataProvider(element.ProjectProvider.getViewID(), this.tree as element.BaseTreeDataProvider<element.Run>));
    }

    set_commands(){
        vscode.commands.registerCommand("teroshdl.view.runs.run_all", (item) => this.run_all(item));
        vscode.commands.registerCommand("teroshdl.view.runs.run", (item) => this.run(item));
    }

    get_selected_project_name(): string | undefined {
        const selected_prj = this.project_manager.get_select_project();
        // No project select
        if (selected_prj.successful === false) {
            return undefined;
        }
        else {
            return (<teroshdl2.project_manager.project_manager.Project_manager>selected_prj.result).get_name();
        }
    }

    async run(item: element.Run){
        const prj_name = this.get_selected_project_name();
        if (prj_name === undefined){
            return;
        }
        const test_list : teroshdl2.project_manager.tool_common.t_test_declaration = {
            name: item.get_name(),
            test_type: "",
            filename: item.get_path(),
            location: item.get_location()
        };
        const result = await this.project_manager.run(prj_name, this.project_manager.get_config_global_config(), [test_list], this.callback_run, this.callback_stream);
        console.log();
    }

    callback_run(result: teroshdl2.project_manager.tool_common.t_test_result[]){
        this.results_manager.set_results(result);
    }
    callback_stream(stream_c: any){
        stream_c.stdout.on('data', function (data: any) {
            console.log(data);
        });
        stream_c.stderr.on('data', function (data: any) {
            console.log(data);
        });
    };

    async run_all(item: element.Run){
    }

    refresh(){
        this.emitter.emit('refresh');
    }

    refresh_tree(){
        this.tree.refresh();
    }
}

