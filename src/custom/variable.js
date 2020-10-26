import { getObjType } from '../utils/util';
import { isInlineStringCell } from '../controllers/inlineString';
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getOrigincell } from '../global/getdata';
import { genarate, valueShowEs } from '../global/format';
import Store from '../store';
import { getSheetIndex, getRangetxt } from '../methods/get';
import luckysheetformula from '../global/formula';
import weConfigsetting from './configsetting';
import sheetmanage from '../controllers/sheetmanage';
import { luckysheetrefreshgrid, jfrefreshgrid } from '../global/refresh';

const weVariable = {
    variablePrefix: '#',
    resolvedVariables: [],
    regex: /(?:([a-zA-Zก-ฮ0-9-.]+)\!(\#[a-zA-Zก-ฮ0-9-.]+|[A-Z]+[0-9]+)|(\#[a-zA-Zก-ฮ0-9-.]+))/g,
    regexIsVar: /[^!](\#[a-zA-Zก-ฮ0-9-.]+)/,
    regexTest: /(\#[a-zA-Zก-ฮ0-9-.]+)/,
    regexTestIsGlobal: /([a-zA-Zก-ฮ0-9-.']+)\!(\#[a-zA-Zก-ฮ0-9-.]+|[A-Z]+[0-9]+)/,
    error: {
        c: "#CIRCULAR!",
        ce: "#CLIENT!",
        se: "#SERVER!",
    },
    init: function (vPrefix) {
        console.log('weVariable::init');
        this.variablePrefix = vPrefix ?? this.variablePrefix;
    },
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
        if (self.regex.test(fx) && !isSub) {
            let matchList = fx.match(self.regex);
            if (matchList) {
                let tempFx = fx;
                for (let vName of matchList) {
                    let resolved = self.resolveFormula(vName, true);
                    if (typeof resolved === 'string' && resolved.substr(0, 1) == '=') {
                        resolved = resolved.replace('=', '');
                    }
                    tempFx = tempFx.replace(vName, resolved);
                }
                return tempFx;
            } else {
                return fx;
            }
        } else if (self.isGlobalFX(fx) && !self.regexIsVar.test(fx)) {
            // TODO: get that sheet
            console.log('Form API = ' + weConfigsetting.formApi);
            if (!weConfigsetting.formApi)
                throw self.error.ce;
            let matched = fx.match(self.regexTestIsGlobal);
            let sheetName = matched[1];
            let afterSheetFx = matched[2];
            console.log('sheetName', sheetName);
            console.log('afterSheetFx', afterSheetFx);
            $.ajax({
                url: weConfigsetting.formApi,
                type: 'post',
                dataType: 'json',
                data: { code: sheetName },
                beforeSend: function () {
                    console.log(`calling: "${weConfigsetting.formApi}" with code "${sheetName}".`);
                },
                success: function (data, textStatus, jqXHR) {
                    console.log('success', data, textStatus);
                    if (data.data) {
                        if (data.statusCode == "0") {
                            let formData = JSON.parse(data.data.data)[0];
                            console.log('formData', formData, Store.luckysheetfile.length);
                            if (!sheetmanage.hasSheet(sheetName)) {
                                console.log('add new sheet');
                                formData.order = Store.luckysheetfile.length;
                                formData.index = sheetName;
                                Store.luckysheetfile.push(formData);
                            }
                            else {
                                console.log('update sheet');
                                let oldSheet = sheetmanage.getSheetByName(sheetName);
                                formData.order = oldSheet.order;
                                formData.index = oldSheet.index;
                                Object.assign(oldSheet, formData);
                            }
                            jfrefreshgrid();
                            let temp = `='${sheetName}'!${self.regexTest.test(afterSheetFx) ? self.resolveFormula(afterSheetFx, true) : afterSheetFx}`;
                            console.log('temp => ' + temp);
                            return self.resolveFormula(temp, true);
                        } else {
                            throw self.error.se;
                        }
                    } else {
                        throw self.error.se;
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('error', textStatus);
                    throw self.error.ce;
                }
            });
        } else if (self.regexTest.test(fx)) {
            let vName = fx.match(self.regexTest)[1];
            // check circular fx
            if (self.resolvedVariables.includes(vName))
                throw self.error.c; // circular error string
            self.resolvedVariables.push(vName);

            let v = self.getVariableByName(vName, !self.isGlobalFX(fx), fx.match(self.regexTestIsGlobal)[1]);
            console.log('v', v);
            if (!v)
                return fx;

            let resolved = self.execFormula(v.formula);
            if (!resolved)
                return '=' + v.formula;
            if (resolved[1] != '#NAME?') { // if fx is not variable
                v.value = resolved[1];
                v.formula = resolved[2];
                return isSub ? v.value : v.formula;
            } else { // if fx is variable
                let matched = v.formula.match(self.regex);
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
    getVariableByName: function (name, isLocal, sheetName) {
        console.log('getVariableByName', name, isLocal, sheetIndex);
        if (isLocal) {
            let variables = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["variable"];
            return variables.find(item => item.name == name);
        } else {
            let sheet = sheetmanage.getSheetByName(sheetName);
            console.log(sheet);
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
            return luckysheetformula.execfunction(this.resolveFormula(txt), undefined, undefined, undefined, true);
        }
    },
    isGlobalFX: function (fx) {
        return this.regexTestIsGlobal.test(fx);
    }
}

export default weVariable;