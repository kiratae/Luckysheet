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
import luckysheetConfigsetting from '../controllers/luckysheetConfigsetting';
import { luckysheetlodingHTML } from '../controllers/constant';

const weVariable = {
    variablePrefix: '#',
    resolvedVariables: [],
    regex: /(?:([a-zA-Zก-ฮ0-9_.]+)\!(\#[a-zA-Zก-ฮ0-9_.]+|[A-Z]+[0-9]+)|(\#[a-zA-Zก-ฮ0-9_.]+))/g,
    regexIsVar: /[^!](\#[a-zA-Zก-ฮ0-9_.]+)/,
    regexTest: /\#([a-zA-Zก-ฮ0-9_.]+)/,
    regexTestIsGlobal: /([a-zA-Zก-ฮ0-9_.']+)\!(\#[a-zA-Zก-ฮ0-9_.]+|[A-Z]+[0-9]+)/,
    error: {
        c: "#CIRCULAR!",
        ce: "#CLIENT!",
        se: "#SERVER!",
        v: "#VAR!",
    },
    init: function(vPrefix) {
        console.log('weVariable::init');
        this.variablePrefix = vPrefix ? vPrefix : this.variablePrefix;
    },
    functionboxshow: function(r, c, d, cell) {
        if (weConfigsetting.formEditor) {
            if (isInlineStringCell(cell)) {
                return getInlineStringNoStyle(r, c);
            } else if (cell.df != null) {
                return getcellvalue(r, c, d, "df");
            } else {
                return valueShowEs(r, c, d);
            }
        } else {
            if (isInlineStringCell(cell)) {
                return getInlineStringNoStyle(r, c);
            } else if (cell.f != null) {
                return getcellvalue(r, c, d, "f");
            } else {
                return valueShowEs(r, c, d);
            }
        }

    },
    luckysheetupdateCell: function(r, c, d, cell) {
        if (weConfigsetting.formEditor) {
            if (isInlineStringCell(cell)) {
                return getInlineStringStyle(r, c, d);
            } else if (cell.df != null) {
                return getcellvalue(r, c, d, "df");
            } else {
                let v = valueShowEs(r, c, d);
                if (cell.qp == "1") {
                    v = "'" + v;
                }
                return v;
            }
        } else {
            if (isInlineStringCell(cell)) {
                return getInlineStringStyle(r, c, d);
            } else if (cell.f != null) {
                return getcellvalue(r, c, d, "f");
            } else {
                let v = valueShowEs(r, c, d);
                if (cell.qp == "1") {
                    v = "'" + v;
                }
                return v;
            }
        }
    },
    transformFormula: function(value) {
        const self = this;
        console.log('transformFormula', value);
        self.resolvedVariables.splice(0, self.resolvedVariables.length);
        if (getObjType(value) == "string") {
            return [self.resolveFormula(value), value]
        } else if (getObjType(value) == "object" && value.df != null) {
            value.f = self.resolveFormula(value.df);
            return value;
        }
    },
    resolveFormula: function(fx, isSub) {
        const self = this;
        if (self.regex.test(fx) && !isSub) {

            return self.resolveMultiVariable(fx);

        } else if (self.isGlobalFX(fx) && !self.regexIsVar.test(fx)) {
            if (!weConfigsetting.formApi)
                throw self.error.ce;
            let matched = fx.match(self.regexTestIsGlobal);
            let sheetName = matched[1].replace(/'/g, '');
            let afterSheetFx = matched[2];

            if (!sheetmanage.getSheetByName(sheetName)) {
                self.addRemoteSheet(sheetName);
            }

            if (self.regexTest.test(afterSheetFx)) {
                return self.resolveVariable(afterSheetFx, isSub, sheetName);
            } else {
                return `='${sheetName}'!${afterSheetFx}`;
            }
        } else if (self.regexTest.test(fx)) {

            return self.resolveVariable(fx, isSub);

        } else {
            return fx;
        }
    },
    getVariableByName: function(name, isLocal, sheetName) {
        const self = this;
        let variables = null;
        if (isLocal)
            variables = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["variable"];
        else
            variables = sheetmanage.getSheetByName(sheetName)["variable"];

        if (variables)
            return variables.find(item => item.name == name);
        else
            throw self.error.v;
    },
    detectCircular: function(varName) {
        const self = this;
        if (self.resolvedVariables.includes(varName))
            throw self.error.c; // circular error string
        self.resolvedVariables.push(varName);
    },
    resolveMultiVariable: function(fx) {
        const self = this;
        let variables = fx.match(self.regex);
        if (variables) {
            let tempFx = fx;
            for (let varName of variables) {
                let resolved = self.resolveFormula(varName, true);
                if (typeof resolved === 'string' && resolved.substr(0, 1) == '=') {
                    resolved = resolved.replace('=', '');
                }
                tempFx = tempFx.replace(varName, resolved);
            }
            return tempFx;
        } else {
            return fx;
        }
    },
    resolveVariable: function(fx, isSub, sheetName) {
        const self = this;
        let varName = fx.match(self.regexTest)[1];

        self.detectCircular(typeof sheetName == 'undefined' ? varName : `${sheetName}!${varName}`);

        let v = self.getVariableByName(varName, (typeof sheetName == 'undefined'), sheetName);
        if (!v)
            return fx;

        let resolved = self.execFormula(v.formula);
        console.log('resolveVariable', resolved, v.formula);
        if (!resolved)
            return '=' + v.formula;
        if (resolved[1] != '#NAME?') { // if fx is not variable
            v.value = resolved[1];
            v.formula = resolved[2];
            return isSub ? v.value : v.formula;
        } else { // if fx is variable
            return self.resolveMultiVariable(v.formula);
        }
    },
    addRemoteSheet: function(name) {
        let sheetName = name.replace('_', '-')
        let removeLoading = function(ex) {
            setTimeout(function() {
                $("#luckysheetloadingdata").fadeOut().remove();
            }, 500);
            if (ex)
                throw ex;
        }
        const self = this;
        let postData = { rptFormCode: sheetName };
        if (!weConfigsetting.formEditor) {
            postData['formReportSetId'] = weConfigsetting.formReportSetId;
        }
        $.ajax({
            url: weConfigsetting.formApi,
            type: 'post',
            dataType: 'json',
            data: postData,
            beforeSend: function() {
                console.log(`calling: "${weConfigsetting.formApi}" with code "${sheetName}".`);
                $("#" + luckysheetConfigsetting.container).append(luckysheetlodingHTML(false));
            },
            success: function(res, textStatus, jqXHR) {
                if (res.data) {
                    if (res.statusCode == "0") {
                        let formData = JSON.parse(res.data.data)[0];

                        formData.order = Store.luckysheetfile.length;
                        formData.index = name;
                        formData.status = 0;
                        formData.hide = 1;
                        formData.allowEdit = false;
                        formData.isTemp = true; //custom
                        formData.data = sheetmanage.buildGridData(formData.celldata);
                        Store.luckysheetfile.push(formData);
                        // sheetmanage.createSheetbydata(formData);
                        // sheetmanage.loadOtherFile(formData);

                        jfrefreshgrid();
                        removeLoading();
                    } else {
                        removeLoading(self.error.se);
                    }
                } else {
                    removeLoading(self.error.se);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('error', textStatus);
                removeLoading(self.error.ce);
            }
        });
    },
    variableHTML: function(text) {
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
    execFormula: function(txt) {
        if (typeof txt == "string" && txt.slice(0, 1) == "=" && txt.length > 1) {
            return luckysheetformula.execfunction(this.resolveFormula(txt), undefined, undefined, undefined, true);
        }
    },
    isGlobalFX: function(fx) {
        return this.regexTestIsGlobal.test(fx);
    }
}

export default weVariable;