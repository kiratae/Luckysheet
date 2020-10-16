import { getObjType } from '../utils/util';
import { isInlineStringCell } from '../controllers/inlineString';
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getOrigincell } from '../global/getdata';
import { genarate, valueShowEs } from '../global/format';
import Store from '../store';
import { getSheetIndex, getRangetxt } from '../methods/get';

const weVariable = {
    variablePrefix: '!',
    resolvedList: [],
    functionboxshow: function (r, c, d, cell) {
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
    luckysheetupdateCell: function (r, c, d, cell) {
        if (isInlineStringCell(cell)) {
            return getInlineStringStyle(r, c, d);
        }
        else if (cell.f != null) {
            return getcellvalue(r, c, d, "df");
        }
        else {
            let v = valueShowEs(r, c, d);
            if (cell.qp == "1") {
                v = "'" + v;
            }
            return v;
        }
    },
    transformFormula: function (value) {
        const self = this;
        let variables = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["variable"];
        self.resolvedList.splice(0, self.resolvedList.length);
        // TODO: resolve display formula
        if (getObjType(value) == "string") {
            return [self.resolveFormulaRecursive(value), value]
        } else if (getObjType(value) == "object" && value.df != null) {
            value.f = self.resolveFormulaRecursive(value.df);
            return value;
        }
    },
    resolveFormulaRecursive: function (fx) {
        const self = this;
        let regex = /(?:\![a-zA-Zก-ฮ0-9]+\![a-zA-Zก-ฮ0-9]+|\![a-zA-Zก-ฮ0-9]+)/gm;
        let matched = fx.match(regex);
        for (let m of matched) {
            let var_arr = m.match(/(?:\![a-zA-Zก-ฮ0-9]+)/gm);
            if (var_arr.length > 1) {

            } else {
                let v = self.getVariableByName(var_arr[0]);
                if(v != null)
                    v.formula;
            }
        }
        return '=1+1';
    },
    getVariableByName: function (name, isLocal = true) {
        if (isLocal)
            return this.formVariables.find(item => item.name == name);
        else
            return null;
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