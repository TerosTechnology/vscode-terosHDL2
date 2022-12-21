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

import * as path_lib from "path";

const BASE_PATH_ICON = path_lib.join(__filename, "..", "..", "..", "..", "resources");

export function get_icon(name: string){
    const icon_path = {
        dark: path_lib.join(BASE_PATH_ICON, "dark",`${name}.svg`),
        light: path_lib.join(BASE_PATH_ICON, "light", `${name}.svg`)
    };
    return icon_path;
}