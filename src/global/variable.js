import { getObjType } from '../utils/util';

const weVariable = {
    variablePrefix: '!',
    functionboxshow: function (cell) {
        console.log("weVariable:functionboxshow", cell);
        if (cell != null && cell.df != null) {
            // TODO : transform df to f
            cell.f = cell.df;
        }
    },
    updatecell: function (value) {
        if (getObjType(value) == "string") {
            console.log("weVariable:updatecell:string", value);
        } else if (getObjType(value) == "object") {
            console.log("weVariable:updatecell:object", value);
        }
    },
    variableHTML: function (text) {
        console.log('variableHTML', text);
        // TODO: custom variable html display in formula bar here!

        // let self = this;
        // let varstack = text.split("");
        // let i = 0,
        //     str = "",
        //     var_str = "";
        // while (i < varstack.length) {
        //     let s = varstack[i];
        //     if(s == self.variablePrefix){
        //         let s_next = "";
        //         if ((i + 1) < varstack.length) {
        //             s_next = varstack[i + 1];
        //         }
        //         str += s;
        //     }else if(){

        //     }
        //     i++;
        // }
        // console.log(var_str);
        return text;
    }
}

export default weVariable;