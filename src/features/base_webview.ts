// Copyright 2022 
// Carlos Alberto Ruiz Naranjo [carlosruiznaranjo@gmail.com]
//
// This file is part of TerosHDL
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
// along with TerosHDL.  If not, see <https://www.gnu.org/licenses/>.
import * as vscode from 'vscode';
import { Multi_project_manager } from 'teroshdl2/out/project_manager/multi_project_manager';
import * as Output_channel_lib from '../lib/utils/output_channel';
import * as utils from '../lib/utils/utils';

// eslint-disable-next-line @typescript-eslint/class-name-casing
export abstract class Base_webview {
    protected context: vscode.ExtensionContext;
    protected output_channel: Output_channel_lib.Output_channel;
    protected manager: Multi_project_manager;

    protected subscriptions: vscode.Disposable[] | undefined;

    protected panel : vscode.WebviewPanel | undefined;
    protected html_base = "";

    protected last_document: utils.t_vscode_document | undefined;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(context: vscode.ExtensionContext, output_channel: Output_channel_lib.Output_channel,
        manager: Multi_project_manager, webview_html_path: string, activation_command: string, id: string) {

            this.context = context;
            this.output_channel = output_channel;
            this.manager = manager;

            this.html_base = utils.get_webview_content(webview_html_path);
    
            vscode.workspace.onDidChangeConfiguration(this.force_update, this, this.subscriptions);
            vscode.commands.registerCommand(`teroshdl.${id}.set_config`, () => this.set_config());

            context.subscriptions.push(
                vscode.commands.registerCommand(
                    activation_command,
                    async () => {
                        await this.create_webview();
                    }
                ),
                vscode.workspace.onDidOpenTextDocument((e) => this.update_open_document(e)),
                vscode.workspace.onDidSaveTextDocument((e) => this.update_open_document(e)),
                vscode.window.onDidChangeVisibleTextEditors((e) => this.update_visible_document(e)),
            );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Abstract
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    abstract create_webview(): void;
    abstract update(vscode_document : utils.t_vscode_document): void;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Update
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async update_open_document(document: vscode.TextDocument) {
        if (this.panel === undefined) {
            return;
        }
        
        let vscode_document = utils.get_vscode_document(document);
        if (vscode_document.is_hdl === false) {
            return;
        }
        await this.update(vscode_document);
    }

    async update_visible_document(e) {
        if (e.length === 0) {
            return;
        }
        let document = e[e.length - 1].document;
        if (this.panel === undefined) {
            return;
        }

        this.update_open_document(document);
    }

    async force_update() {
        if (this.panel !== undefined && this.last_document !== undefined) {
            await this.update(this.last_document);
        }
    }

    set_config() {
        this.force_update();
    }
}