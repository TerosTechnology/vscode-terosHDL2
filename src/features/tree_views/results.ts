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
import * as teroshdl2 from "teroshdl2";

export class Results_manager{
    private res : teroshdl2.project_manager.tool_common.t_test_result[] = [];

    public set_results(res : teroshdl2.project_manager.tool_common.t_test_result[]){
        this.res = res;
    }

    public get_results(){
        return this.res;
    }
}