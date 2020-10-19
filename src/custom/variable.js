import { getObjType } from '../utils/util';
import { isInlineStringCell } from '../controllers/inlineString';
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getOrigincell } from '../global/getdata';
import { genarate, valueShowEs } from '../global/format';
import Store from '../store';
import { getSheetIndex, getRangetxt } from '../methods/get';
import luckysheetformula from '../global/formula';

const weVariable = {
    variablePrefix: '!',
    resolvedVariables: [],
    regexGobal: /(?:\![a-zA-Z]+\![a-zA-Z]+|\![a-zA-Z]+)/gm,
    regexLocal: /(?:\![a-zA-Z]+)/gm,
    regexTestGobal: /\!([a-zA-Z]+)/,
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
        else if (cell.df != null) {
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
        self.resolvedVariables.splice(0, self.resolvedVariables.length);
        // TODO: resolve display formula
        if (getObjType(value) == "string") {
            return [self.resolveFormula(value), value]
        } else if (getObjType(value) == "object" && value.df != null) {
            value.f = self.resolveFormula(value.df);
            return value;
        }
    },
    resolveFormula: function (fx, isSub) {
        const self = this;
        // if fx is variable like !A, !B, ...
        // console.log('resolveFormula', fx);
        if (self.regexGobal.test(fx) && !isSub) {
            let matchList = fx.match(self.regexGobal);
            if (matchList) {
                for (let vName of matchList) {
                    fx = fx.replace(vName, self.resolveFormula(vName, true));
                }
                return fx;
            }
        } else if (self.regexTestGobal.test(fx)) {
            let vName = fx.match(self.regexTestGobal)[1];
            // check circular fx
            if (self.resolvedVariables.includes(vName))
                throw luckysheetformula.error.c; // circular error string
            self.resolvedVariables.push(vName);

            // console.log('vName', vName);
            let v = self.getVariableByName(vName, true);
            // console.log('v', v);
            if (!v)
                return fx;
            let resolved = self.execFormula(v.formula);
            // console.log('resolved', resolved);
            if (!resolved)
                return '=' + v.formula;
            if (resolved[1] != '#NAME?') { // if fx is not variable
                v.value = resolved[1];
                v.formula = resolved[2];
                return isSub ? v.value : v.formula;
            } else { // if fx is variable
                let matched = v.formula.match(self.regexGobal);
                if (matched) {
                    let tempFx = v.formula;
                    for (let m of matched) {
                        tempFx = tempFx.replace(m, self.resolveFormula(m, true));
                    }
                    return tempFx;
                }
            }
        } else {
            return fx;
        }
    },
    getVariableByName: function (name, isLocal) {
        if (isLocal) {
            let variables = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["variable"];
            return variables.find(item => item.name == name);
        } else {
            return null;
        }
    },
    variableHTML: function (text) {
        // console.log('variableHTML', text);
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
    },
    execFormula: function (txt) {
        if (typeof txt == "string" && txt.slice(0, 1) == "=" && txt.length > 1) {
            return luckysheetformula.execfunction(txt, undefined, undefined, undefined, true);
        }
    }
}

export default weVariable;