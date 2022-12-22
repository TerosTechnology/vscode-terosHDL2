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
import {Run_output_manager} from "../run_output";
import {Logger} from "../logger";

export class Runs_manager {
    private tree : element.ProjectProvider;
    private project_manager : Multi_project_manager;
    private emitter : events.EventEmitter;
    private run_output_manager : Run_output_manager;
    private logger : Logger;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(context: vscode.ExtensionContext, manager: Multi_project_manager, emitter : events.EventEmitter,
        run_output_manager: Run_output_manager, logger: Logger) {

        this.set_commands();

        this.logger = logger;
        this.run_output_manager = run_output_manager;
        this.emitter = emitter;
        this.project_manager = manager;
        this.tree = new element.ProjectProvider(manager);
        
        context.subscriptions.push(vscode.window.registerTreeDataProvider(element.ProjectProvider.getViewID(), this.tree as element.BaseTreeDataProvider<element.Run>));
    }

    set_commands(){
        vscode.commands.registerCommand("teroshdl.view.runs.run_all", (item) => this.run(undefined));
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

    async run(item: element.Run | undefined){
        // Init output to empty
        this.refresh([]);

        const prj_name = this.get_selected_project_name();
        if (prj_name === undefined){
            return;
        }

        let test_list : teroshdl2.project_manager.tool_common.t_test_declaration[] = [];
        if (item === undefined){
            test_list = await this.project_manager.get_test_list(prj_name, this.project_manager.get_config_global_config());
        }
        else{
            const test : teroshdl2.project_manager.tool_common.t_test_declaration = {
                name: item.get_name(),
                test_type: "",
                filename: item.get_path(),
                location: item.get_location()
            };
            test_list = [test];
        }

        const selfm = this;
        await this.project_manager.run(prj_name, this.project_manager.get_config_global_config(), test_list, 
            (function(result: teroshdl2.project_manager.tool_common.t_test_result[]) { 
                selfm.run_output_manager.set_results(result);
                selfm.emitter.emit('refresh-result');
            }),
            (function(stream_c: any) { 
                stream_c.stdout.on('data', function (data: any) {
                    selfm.logger.log(data);
                });
                stream_c.stderr.on('data', function (data: any) {
                    selfm.logger.log(data);
                });
            }),
        );
    }

    callback_run(result: teroshdl2.project_manager.tool_common.t_test_result[]){
        this.refresh(result);
    }

    refresh(result: teroshdl2.project_manager.tool_common.t_test_result[]){
        this.run_output_manager.set_results(result);
        this.emitter.emit('refresh-result');
    }

    refresh_tree(){
        this.tree.refresh();
    }
}

