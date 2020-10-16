import { getObjType } from '../utils/util';
import { isInlineStringCell } from '../controllers/inlineString';
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getOrigincell } from '../global/getdata';
import { genarate, valueShowEs } from '../global/format';

const weVariable = {
    variablePrefix: '!',
    functionboxshow: function (r, c, d, cell) {
        console.log("weVariable:functionboxshow", cell);
        if (isInlineStringCell(cell)) {
            return getInlineStringNoStyle(r, c);
        }
        else if (cell.df != null) {
            return getcellvalue(r, c, d, "df");
        }
        else {
            return valueShowEs(r, c, d);
        }
    },
    updatecell: function (r, c, d, value) {
        if (getObjType(value) == "string") {
            console.log("weVariable::updatecell:string", r, c, d, value);
        } else if (getObjType(value) == "object") {
            console.log("weVariable::updatecell:object", r, c, d, value);
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