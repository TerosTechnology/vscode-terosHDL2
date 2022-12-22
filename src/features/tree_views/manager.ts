/* eslint-disable @typescript-eslint/class-name-casing */
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

import {Project_manager} from "./project/manager";
import {Source_manager} from "./source/manager";
import {Runs_manager} from "./runs/manager";
import {Result_manager} from "./result/manager";
import {Run_output_manager} from "./run_output";
import {Logger} from "./logger";

import * as events from "events";
import * as vscode from "vscode";
import { Multi_project_manager } from 'teroshdl2/out/project_manager/multi_project_manager';

let project_manager : Project_manager;
let source_manager : Source_manager;
let runs_manager : Runs_manager;
let result_manager : Result_manager;
let run_output : Run_output_manager = new Run_output_manager();

export class Tree_view_manager{
    private emitter : events.EventEmitter = new events.EventEmitter();
    private logger : Logger = new Logger();

    constructor(context: vscode.ExtensionContext, manager: Multi_project_manager){
        this.emitter.addListener('refresh', this.refresh);
        this.emitter.addListener('refresh-result', this.refresh_result);

        project_manager = new Project_manager(context, manager, this.emitter);
        source_manager = new Source_manager(context, manager, this.emitter);
        runs_manager = new Runs_manager(context, manager, this.emitter, run_output, this.logger);
        result_manager = new Result_manager(context, manager, this.emitter, run_output);

        this.refresh();
    }

    refresh(){
        source_manager.refresh_tree();
        project_manager.refresh_tree();
        runs_manager.refresh_tree();
    }

    refresh_result(){
        result_manager.refresh_tree();
    }
}

