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

import * as vscode from "vscode";
import { Multi_project_manager } from 'teroshdl2/out/project_manager/multi_project_manager';

export class Tree_view_manager{
    private project_manager : Project_manager;
    private source_manager : Source_manager;

    constructor(context: vscode.ExtensionContext, manager: Multi_project_manager){
        this.project_manager = new Project_manager(context, manager, this.refresh);
        this.source_manager = new Source_manager(context, manager, this.refresh);
    }

    refresh(){
        this.project_manager.refresh();
        this.source_manager.refresh();
    }
}