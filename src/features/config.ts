/* eslint-disable @typescript-eslint/class-name-casing */
// Copyright 2020 Teros Technology
//
// Ismael Perez Rojo
// Carlos Alberto Ruiz Naranjo
// Alfredo Saez
//
// This file is part of vscode-terosHDL.
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
// along with Colibri.  If not, see <https://www.gnu.org/licenses/>.

import * as vscode from 'vscode';
import * as Output_channel_lib from '../lib/utils/output_channel';
import * as teroshdl2 from 'teroshdl2';
import { Multi_project_manager } from 'teroshdl2/out/project_manager/multi_project_manager';

export class Config_manager {

    protected context: vscode.ExtensionContext;
    private manager: Multi_project_manager;
    private panel: vscode.WebviewPanel | undefined = undefined;
    private web_content: string;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(context: vscode.ExtensionContext, output_channel: Output_channel_lib.Output_channel,
        manager: Multi_project_manager) {

        this.context = context;
        this.manager = manager;
        this.web_content = teroshdl2.config.WEB_CONFIG;

        const activation_command = 'teroshdl.configuration';
        vscode.commands.registerCommand(activation_command, () => this.create_webview());
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Webview creator
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    async create_webview() {
        if (this.panel === undefined) {
            this.panel = vscode.window.createWebviewPanel(
                'catCoding',
                'TerosHDL configuration',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
            this.panel.onDidDispose(
                () => {
                    this.panel = undefined;
                },
                null,
                this.context.subscriptions
            );
            // Handle messages from the webview
            this.panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case 'set_config':
                            this.set_config(message.config);
                            return;
                        case 'set_config_and_close':
                            this.set_config_and_close(message.config);
                            return;
                        case 'close':
                            this.close_panel();
                            return;
                    }
                },
                undefined,
                this.context.subscriptions
            );
            this.panel.webview.html = this.web_content;
            await this.panel?.webview.postMessage({
              command: "set_config",
              config: this.manager.get_config_global_config()
            });
        }
        else {
        }
        // await this.update(document);
    }


    set_config(config: any){
        this.manager.set_global_config_from_json(config);
    }

    set_config_and_close(config: any){
        this.manager.set_global_config_from_json(config);
        this.close_panel();
    }

    close_panel() {
        this.panel?.dispose();
    }


}






