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


/* eslint-disable @typescript-eslint/class-name-casing */
import * as vscode from 'vscode';
import * as teroshdl2 from 'teroshdl2';
import * as Output_channel_lib from '../utils/output_channel';
import { Multi_project_manager } from 'teroshdl2/out/project_manager/multi_project_manager';
import * as utils from '../utils/utils';

const ERROR_CODE = Output_channel_lib.ERROR_CODE;

let formatter_vhdl: Formatter | undefined = undefined;
let formatter_verilog: Formatter | undefined = undefined;

class Formatter {

    private manager: Multi_project_manager;
    private lang: teroshdl2.common.general.HDL_LANG;
    private output_channel: Output_channel_lib.Output_channel;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(lang: teroshdl2.common.general.HDL_LANG, manager: Multi_project_manager,
        output_channel: Output_channel_lib.Output_channel) {
        this.manager = manager;
        this.lang = lang;
        this.output_channel = output_channel;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Configuration
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    private get_config_manager() {
        const config = this.manager.get_config_manager();
        return config;
    }

    private get_formatter_name() {
        const config_manager = this.get_config_manager();
        if (this.lang === teroshdl2.common.general.HDL_LANG.VHDL) {
            return config_manager.get_formatter_name_vhdl();
        }
        else {
            return config_manager.get_formatter_name_verilog();
        }
    }

    private get_formatter_config() {
        const config_manager = this.get_config_manager();
        if (this.lang === teroshdl2.common.general.HDL_LANG.VHDL) {
            return config_manager.get_formatter_config_vhdl();
        }
        else {
            return config_manager.get_formatter_config_verilog();
        }
    }

    private get_pytyon_path() {
        const config_manager = this.get_config_manager();
        const python_path = config_manager.get_exec_config().python_path;
        return python_path;
    }

    public async format(code) {
        const formatter_name = this.get_formatter_name();
        const formater_config = this.get_formatter_config();
        const python_path = this.get_pytyon_path();
        const formatter = new teroshdl2.formatter.formatter.Formatter();
        const result = await formatter.format_from_code(formatter_name, code, formater_config, python_path);
        return result;
    }
}

export class Formatter_manager {
    private output_channel: Output_channel_lib.Output_channel;
    private manager: Multi_project_manager;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(context: vscode.ExtensionContext, output_channel: Output_channel_lib.Output_channel,
        manager: Multi_project_manager) {

        this.output_channel = output_channel;
        this.manager = manager;

        formatter_vhdl = new Formatter(teroshdl2.common.general.HDL_LANG.VHDL, manager, output_channel);
        formatter_verilog = new Formatter(teroshdl2.common.general.HDL_LANG.VERILOG, manager, output_channel);

        const disposable = vscode.languages.registerDocumentFormattingEditProvider(
            [{ scheme: "file", language: "vhdl" }, { scheme: "file", language: "verilog" },
            { scheme: "file", language: "systemverilog" }],
            { provideDocumentFormattingEdits }
        );
        context.subscriptions.push(disposable);
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'teroshdl.format',
                async () => {
                    vscode.commands.executeCommand("editor.action.format");
                }
            )
        );
    }
}

async function provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions,
    token: vscode.CancellationToken): Promise<vscode.TextEdit[]> {

    const edits: vscode.TextEdit[] = [];
    if (formatter_verilog === undefined || formatter_vhdl === undefined){
        return edits;
    }

    //Get document code
    let code_document: string = document.getText();
    let selection_document = getDocumentRange(document);

    //Get selected text
    let editor = vscode.window.activeTextEditor;
    let selection_selected_text;
    let code_selected_text: string = '';
    if (editor !== undefined) {
        selection_selected_text = editor.selection;
        code_selected_text = editor.document.getText(editor.selection);
    }

    //Code to format
    let format_mode_selection: boolean = false;
    let code_to_format: string = '';
    let selection_to_format;
    if (code_selected_text !== '') {
        let init: number = utils.line_index_to_character_index(selection_selected_text._start._line,
            selection_selected_text._start._character, code_document);
        let end: number = utils.line_index_to_character_index(selection_selected_text._end._line,
            selection_selected_text._end._character, code_document);
        let selection_add: string = "#$$#colibri#$$#" + code_selected_text + "%%!!teros!!%%";
        code_to_format = utils.replace_range(code_document, init, end, selection_add);
        format_mode_selection = true;

        code_to_format = code_selected_text;
        selection_to_format = selection_selected_text;
    }
    else {
        code_to_format = code_document;
        selection_to_format = selection_document;
    }

    let code_format: string;
    if (document.languageId === "vhdl") {
        code_format = (await formatter_vhdl.format(code_to_format)).code_formatted;
    }
    else {
        code_format = (await formatter_verilog.format(code_to_format)).code_formatted;
    }
    //Error
    if (code_format === null) {
        // vscode.window.showErrorMessage('Select a valid file.!');
        console.log("Error format code.");
        return edits;
    }
    else {
        const replacement = vscode.TextEdit.replace(
            selection_to_format,
            code_format
        );
        edits.push(replacement);
        return edits;
    }
}

export const getDocumentRange = (document: vscode.TextDocument): vscode.Range => {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(
        0,
        0,
        lastLineId,
        document.lineAt(lastLineId).text.length
    );
};