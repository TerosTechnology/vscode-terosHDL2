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
import * as utils from "./utils";
import { Multi_project_manager } from 'teroshdl2/out/project_manager/multi_project_manager';
import * as teroshdl2 from 'teroshdl2';

export class Source_manager {
    private tree: element.ProjectProvider;
    private project_manager: Multi_project_manager;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(context: vscode.ExtensionContext, manager: Multi_project_manager) {
        this.set_commands();

        this.project_manager = manager;
        this.tree = new element.ProjectProvider(manager);

        context.subscriptions.push(vscode.window.registerTreeDataProvider(element.ProjectProvider.getViewID(), this.tree as element.BaseTreeDataProvider<element.Source_tree_element>));
    }

    set_commands() {
        vscode.commands.registerCommand("teroshdl.view.source.select_toplevel", (item) => this.select_top(item));
        vscode.commands.registerCommand("teroshdl.view.source.add", () => this.add());
        vscode.commands.registerCommand("teroshdl.view.source.add_source_to_library", (item) => this.add_source_to_library(item));
        vscode.commands.registerCommand("teroshdl.view.source.delete_library", (item) => this.delete_library(item));
        vscode.commands.registerCommand("teroshdl.view.source.delete_source", (item) => this.delete_source(item));
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Project
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async add() {
        const prj_name = this.get_selected_project_name();
        if (prj_name === undefined) {
            return;
        }

        const element_types = ["Source", "Library"];
        const picker_value = await utils.get_picker_value(element_types, "Add source/library:");

        // Add source
        if (picker_value === element_types[0]) {
            const element_types = ["Browser", "Load from CSV"];
            const picker_value = await utils.get_picker_value(element_types, "Add from:");

            // Add from browser
            if (picker_value === element_types[0]) {
                await utils.add_sources_from_open_dialog(this.project_manager, prj_name, "");
                // const source_path_list = await utils.get_from_open_dialog(true);
                // source_path_list.forEach(source_path => {
                //     const f : teroshdl2.project_manager.common.t_file_reduced = {
                //         name: source_path,
                //         is_include_file: false,
                //         include_path: "",
                //         logical_name: ""
                //     };
                //     this.project_manager.add_file(prj_name, f);
                // });
            }
            // Add from CSV
            else if (picker_value === element_types[1]) {
                const csv_path = await utils.get_from_open_dialog(false);
                if (csv_path.length !== 0) {
                    this.project_manager.add_file_from_csv(prj_name, csv_path[0]);
                }
            }
        }
        // Add library
        else {
            const logical_name = await utils.get_from_input_box("Add new library", "Library name");
            if (logical_name !== undefined) {
                this.project_manager.add_logical(prj_name, logical_name);
            }
        }
        this.refresh();
    }

    async add_source_to_library(item: element.Source_tree_element) {
        const prj_name = this.get_selected_project_name();
        if (prj_name === undefined) {
            return;
        }
        await utils.add_sources_from_open_dialog(this.project_manager, prj_name, item.get_logical_name());
        this.refresh();
    }

    async delete_library(item: element.Source_tree_element) {
        const prj_name = this.get_selected_project_name();
        if (prj_name === undefined) {
            return;
        }
        this.project_manager.delete_file_by_logical_name(prj_name, item.get_logical_name());
        this.refresh();
    }

    async delete_source(item: element.Source_tree_element) {
        const prj_name = this.get_selected_project_name();
        if (prj_name === undefined) {
            return;
        }
        this.project_manager.delete_file(prj_name, item.get_name(), item.get_logical_name());
        this.refresh();
    }

    async select_top(item: element.Source_tree_element) {
        const prj_name = this.get_selected_project_name();
        if (prj_name === undefined) {
            return;
        }
        this.project_manager.add_toplevel_path(prj_name, item.get_name());
        this.refresh();
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

    refresh(){
        this.tree.refresh();
    }
}

